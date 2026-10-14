import { getUserByEmail } from "@/db/queries";
import { LoginUser } from "@/types/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const secret = process.env.JWT_SECRET!;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const params: { user: LoginUser } = await req.json();
  const loginInput = params.user;

  console.log(params);

  const user = await getUserByEmail(loginInput.email);
  if (!user) return new NextResponse(null, { status: 400 });

  bcrypt.compare(loginInput.password, user.password_hash, () => {
    return new NextResponse(null, { status: 400 });
  });

  console.log(secret);
  const { password_hash, ...publicUser } = user;
  // Token no momento sem tempo de expiração
  const token = jwt.sign(JSON.stringify(publicUser), secret);
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token);

  return new NextResponse(null, { status: 200 });
}
