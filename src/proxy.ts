import { NextResponse, type NextRequest } from "next/server";

// Subdomain routing:
//   acme.forge.so      → serve /p/[first-segment] from acme's workspace
//   acme.forge.so/foo  → serve /p/foo from acme's workspace
//   forge.so           → serve normal app routes
//   localhost:3000     → serve normal app routes

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // Extract subdomain
  const hostname = host.split(":")[0];
  const rootHostname = ROOT_DOMAIN.split(":")[0];

  // Detect subdomain: any hostname that ends with .<rootHostname> and isn't the root itself
  const isSubdomain =
    hostname !== rootHostname &&
    hostname !== `www.${rootHostname}` &&
    hostname.endsWith(`.${rootHostname}`);

  if (!isSubdomain) {
    return NextResponse.next();
  }

  // The subdomain is the workspace slug
  const subdomain = hostname.replace(`.${rootHostname}`, "");

  // Block reserved subdomains
  if (["www", "app", "api", "admin", "dashboard", "editor"].includes(subdomain)) {
    return NextResponse.next();
  }

  // Rewrite to a server handler that resolves the subdomain → workspace → page
  // For now, rewrite /<anything> to /api/serve?subdomain=X&path=Y
  // The actual serving happens in app/api/serve/route.ts
  const path = url.pathname === "/" ? "" : url.pathname.slice(1);

  const rewriteUrl = url.clone();
  rewriteUrl.pathname = `/_serve/${subdomain}`;
  rewriteUrl.search = path ? `?path=${encodeURIComponent(path)}` : "";

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/((?!_next/|api/health|favicon.ico).*)"],
};
