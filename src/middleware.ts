import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  //SUPABASE CLIENT
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Role Based Access Control
  if (user) {
    const userRole = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .then((result) => result.data && result.data[0].role);

    if (path.startsWith("/admin") && userRole != "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    } else if (path.startsWith("/teacher") && userRole != "teacher") {
      return NextResponse.redirect(new URL("/", request.url));
    } else if (path.startsWith("/student") && userRole != "student") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect if not authenticated
  if (
    path.startsWith("/admin") ||
    path.startsWith("/teacher") ||
    path.startsWith("/student")
  ) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if ((path.startsWith("/login") || path.startsWith("/signin")) && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const emailLinkError = "Email link is invalid or has expired";
  if (
    request.nextUrl.searchParams.get("error_description") === emailLinkError &&
    request.nextUrl.pathname !== "/signup"
  ) {
    return NextResponse.redirect(
      new URL(
        `/signup?error_description=${request.nextUrl.searchParams.get(
          "error_description"
        )}`,
        request.url
      )
    );
  }

  if (["/login", "/signup"].includes(request.nextUrl.pathname)) {
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return response;
}
