import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.JWT_SECRET!;

const publicRoutes = ["/", "/auth/register", "/auth/login"];

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  const authToken = req.cookies.get("auth-token")?.value;
  if (!authToken) return new NextResponse(null, { status: 401 });

  jwt.verify(authToken, secret, (_, decoded) => {
    if (!decoded) {
      return new NextResponse(null, { status: 401 });
    }
  })!;

  return NextResponse.next();
}
