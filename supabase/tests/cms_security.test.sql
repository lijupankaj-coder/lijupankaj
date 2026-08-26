begin;
select plan(12);

select has_table('public', 'published_site', 'published snapshot table exists');
select has_table('public', 'projects', 'project draft table exists');
select has_table('public', 'media_assets', 'private media metadata table exists');
select has_table('public', 'audit_log', 'audit table exists');
select ok(has_table_privilege('anon', 'public.published_site', 'SELECT'), 'anonymous visitors can read the published snapshot');
select ok(not has_table_privilege('anon', 'public.projects', 'SELECT'), 'anonymous visitors cannot read project drafts');
select ok(not has_table_privilege('anon', 'public.media_assets', 'SELECT'), 'anonymous visitors cannot browse private media metadata');
select ok(not has_table_privilege('anon', 'public.published_site', 'INSERT'), 'anonymous visitors cannot publish');
select ok(has_table_privilege('authenticated', 'public.projects', 'SELECT'), 'authenticated role receives the draft table grant');
select ok((select relrowsecurity from pg_class where oid = 'public.projects'::regclass), 'projects have RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.media_assets'::regclass), 'media assets have RLS enabled');
select ok((select not public from storage.buckets where id = 'cms-media'), 'CMS storage bucket is private');

select * from finish();
rollback;
