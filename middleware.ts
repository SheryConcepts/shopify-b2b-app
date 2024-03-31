/*
    Add Content Security Policy headers to all relevant requests.
*/

import { NextRequest, NextResponse } from "next/server";
import isSignedIn from "./lib/session";
import { redirect } from "next/navigation";

export const config = {
  matcher: [
    /*
     * Exceptions:
     * /api/auth, /api/webhooks, /api/proxy_route, /api/gdpr, /_next,
     * /_proxy, /_auth, /_static, /_vercel, /public (/favicon.ico, etc)
     */
    "/((?!api/auth|api/webhooks|api/proxy_route|api/gdpr|_next|_proxy|_auth|_static|_vercel|[\\w-]+\\.\\w+).*)",
    "/shop/:path",
  ],
};

export async function middleware(request: NextRequest) {
  const {
    nextUrl: { search, pathname },
  } = request;

  const url = request.nextUrl.clone();
  const signedIn = await isSignedIn();
  if (!signedIn && pathname.startsWith("/shop") && pathname !== "/shop") {
    url.pathname = "/shop";
    return NextResponse.redirect(url);
  }

  if (signedIn && pathname === "/shop") {
    url.pathname = "/shop/products";
    return NextResponse.redirect(url);
  }

  // const urlSearchParams = new URLSearchParams(search);
  // const params = Object.fromEntries(urlSearchParams.entries());
  //
  // const shop = params.shop || "*.myshopify.com";
  //
  const res = NextResponse.next();
  // res.headers.set(
  // 	"Content-Security-Policy",
  // 	`frame-ancestors https://${shop} https://admin.shopify.com;`
  // );

  // You can also set request headers in NextResponse.rewrite
  return res;
}
