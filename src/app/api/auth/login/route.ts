import { getUserByEmail } from "@/db/queries";
import { User } from "@/modules/users/user.entity";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { LoginUserDTO } from "@/modules/users/login-user.dto";
import { ResponseUserDTO } from "@/modules/users/response-user.dto";

const secret = process.env.JWT_SECRET!;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const params: { user: LoginUserDTO } = await req.json();
  const loginInput = params.user;

  const user = User.fromDB(await getUserByEmail(loginInput.email));
  if (!user) return new NextResponse(null, { status: 400 });

  const passwordMatches = await user.comparePassword(loginInput.password);
  if (!passwordMatches) return new NextResponse(null, { status: 400 });

  const responseUser = ResponseUserDTO.fromUser(user);
  // Token no momento sem tempo de expiração
  const token = jwt.sign(JSON.stringify(responseUser), secret);
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token);

  return new NextResponse(null, { status: 200 });
}
