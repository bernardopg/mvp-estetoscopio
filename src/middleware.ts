import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que não requerem autenticação
const publicPaths = ["/login", "/signup"];

// Rotas que devem redirecionar para / se o usuário já estiver autenticado
const authPaths = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token");

  // Verificar se o usuário tem um token (autenticação básica)
  const isAuthenticated = !!token?.value;

  // Se a rota é pública, permitir acesso
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Se o usuário está autenticado e tenta acessar login/signup, redirecionar para /
  if (isAuthenticated && authPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Se a rota não é pública e o usuário não está autenticado, redirecionar para /login
  if (!isPublicPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|uploads).*)",
  ],
};
