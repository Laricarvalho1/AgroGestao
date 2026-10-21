import { createUser } from "@/db/queries";
import { RegisterUserDTO } from "@/modules/users/register-user.dto";
import { ResponseUserDTO } from "@/modules/users/response-user.dto";
import { User } from "@/modules/users/user.entity";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const salt = Number(process.env.SALT_ROUNDS!);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const params: { user: RegisterUserDTO } = await req.json();
  const userInput = params.user;

  const hashedPassword = await bcrypt.hash(userInput.password, salt);
  const createdUser = User.fromDB(await createUser(userInput, hashedPassword));
  if (!createdUser)
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 500 },
    );

  const responseUser = ResponseUserDTO.fromUser(createdUser);

  return NextResponse.json(responseUser, { status: 201 });
}
