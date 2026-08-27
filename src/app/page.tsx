import { InnovationGrid } from "@/components/public/innovation-grid";
import { PortfolioGallery } from "@/components/public/portfolio-gallery";
import { getPublishedSnapshot } from "@/lib/cms/snapshot";
import { buildStructuredData, serializeJsonLd } from "@/lib/seo";
import Image from "next/image";

export const revalidate = 60;

export default async function HomePage() {
  const snapshot = await getPublishedSnapshot();
  const { sections, projects, categories } = snapshot;
  const profileUrl = sections.hero.profileMediaId ? `/api/media/${sections.hero.profileMediaId}` : sections.hero.profileFallbackUrl;
  const resumeUrl = sections.resume.mediaId ? `/api/media/${sections.resume.mediaId}?download=1` : sections.resume.fallbackUrl;
  const featured = projects.filter((project) => project.featured).slice(0, 8);
  const remaining = projects.filter((project) => !featured.some((item) => item.id === project.id));
  const portfolioProjects = [...featured, ...remaining];
  const visibleCategories = categories.filter((category) => projects.some((project) => project.category?.id === category.id));
  const structuredData = buildStructuredData(snapshot);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Liju Pankaj, home"><span>LIJU</span> PANKAJ</a>
        <nav aria-label="Primary navigation">
          {sections.navigation.items.filter((item) => item.visible).map((item) => <a key={item.id} href={item.href}>{item.label}</a>)}
        </nav>
        <a className="header-resume" href={resumeUrl} download>{sections.navigation.resumeLabel}</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{sections.hero.eyebrow}</p>
          <h1>{sections.hero.title}</h1>
          <p className="positioning">{sections.hero.positioning}</p>
          <p className="hero-intro">{sections.hero.introduction}</p>
          <div className="hero-actions"><a className="primary-button" href="#work">{sections.hero.primaryButtonLabel}</a><a className="outline-button" href={resumeUrl} download>{sections.hero.resumeButtonLabel}</a></div>
          <dl className="hero-facts"><div><dt>Experience</dt><dd>24 years</dd></div><div><dt>UAE practice</dt><dd>21 years</dd></div><div><dt>Based in</dt><dd>{sections.hero.location}</dd></div></dl>
        </div>
        <div className="portrait-frame"><Image src={profileUrl} alt="Liju Pankaj, Senior Graphic Designer" width={900} height={830} priority sizes="(max-width: 620px) 90vw, (max-width: 900px) 440px, 28vw" /></div>
      </section>

      {sections.visibility.profile && <section className="section profile-section" id="about">
        <div className="section-label"><span>01</span><p>Professional profile</p></div>
        <div className="section-content"><h2>{sections.profile.heading}</h2><p className="lead">{sections.profile.lead}</p><div className="profile-copy">{sections.profile.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="pillars">{sections.profile.pillars.map((pillar) => <span key={pillar}>{pillar}</span>)}</div></div>
      </section>}

      {sections.visibility.experience && <section className="section" id="experience">
        <div className="section-label"><span>02</span><p>Experience</p></div>
        <div className="section-content"><h2>{sections.experience.heading}</h2><div className="timeline">{sections.experience.items.map((item) => <article key={item.id}><div><p className="meta">{item.period}</p><p>{item.location}</p></div><div><h3>{item.title}</h3><p className="company">{item.company}</p><p>{item.summary}</p></div></article>)}</div></div>
      </section>}

      {sections.visibility.portfolio && <section className="section work-section" id="work">
        <div className="section-label"><span>03</span><p>Portfolio</p></div>
        <div className="section-content"><h2>{sections.portfolio.heading}</h2><p className="lead narrow">{sections.portfolio.introduction}</p>{portfolioProjects.length ? <PortfolioGallery projects={portfolioProjects} categories={visibleCategories} /> : <div className="empty-portfolio"><span aria-hidden="true">LP</span><p>{sections.portfolio.emptyMessage}</p><small>Image coming soon</small></div>}</div>
      </section>}

      {sections.visibility.capabilities && <section className="section" id="capabilities">
        <div className="section-label"><span>04</span><p>Capabilities</p></div>
        <div className="section-content"><h2>{sections.capabilities.heading}</h2><div className="capability-grid">{sections.capabilities.items.map((item, index) => <article key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.summary}</p></article>)}</div><div className="tool-list">{sections.capabilities.tools.map((tool) => <span key={tool}>{tool}</span>)}</div></div>
      </section>}

      {sections.visibility.innovation && <section className="section innovation-section" id="innovation">
        <div className="section-label"><span>05</span><p>AI & innovation</p></div>
        <div className="section-content"><h2>{sections.innovation.heading}</h2><p className="lead narrow">{sections.innovation.introduction}</p><InnovationGrid apps={sections.innovation.apps} accessNote={sections.innovation.accessNote} /></div>
      </section>}

      {sections.visibility.education && <section className="section compact-section" id="education">
        <div className="section-label"><span>06</span><p>Foundation</p></div>
        <div className="section-content"><h2>{sections.education.heading}</h2><div className="education-grid">{sections.education.items.map((item) => <article key={item.id}><h3>{item.qualification}</h3><p>{item.institution}</p></article>)}<article><h3>Languages</h3><p>{sections.education.languages.join(" · ")}</p></article></div></div>
      </section>}

      {sections.visibility.contact && <section className="contact-section" id="contact"><p className="eyebrow">Available for senior creative opportunities</p><h2>{sections.contact.heading}</h2><a className="contact-email" href={`mailto:${sections.contact.email}`}>{sections.contact.email}</a><div><a href={`tel:${sections.contact.phone.replace(/\s/g, "")}`}>{sections.contact.phone}</a><span>{sections.contact.location}</span></div><a className="primary-button" href={`mailto:${sections.contact.email}`}>{sections.contact.buttonLabel}</a></section>}
      <footer><p>© {new Date().getFullYear()} {sections.footer.copyright}</p><p>{sections.footer.descriptor}</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
