import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseConfig } from "@/lib/env/public";
import { publicUrl } from "@/lib/http/public-url";

const publicAdminPaths = ["/admin/login", "/admin/forgot-password", "/admin/reset-password", "/auth/callback"];

export async function updateSession(request: NextRequest) {
  const config = getPublicSupabaseConfig();
  if (!config) {
    if (request.nextUrl.pathname === "/admin/login") return NextResponse.next({ request });
    const setupUrl = publicUrl("/admin/login?setup=1", request.url);
    return NextResponse.redirect(setupUrl);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      }
    }
  });

  const { data } = await supabase.auth.getClaims();
  const isPublicAdminPath = publicAdminPaths.some((path) => request.nextUrl.pathname.startsWith(path));
  if (!data?.claims && request.nextUrl.pathname.startsWith("/admin") && !isPublicAdminPath) {
    const loginUrl = publicUrl("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return response;
}
