import { createUser } from "@/db/queries";
import { CreateUserInput, PublicUser } from "@/types/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const salt = Number(process.env.SALT_ROUNDS!);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const params: { user: CreateUserInput } = await req.json();
  const userInput = params.user;

  const hashedPassword = await bcrypt.hash(userInput.password, salt);
  const createdUser = await createUser(userInput, hashedPassword);

  if (!createdUser)
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 500 },
    );

  const { password_hash, ...responseUser } = createdUser;

  return NextResponse.json(responseUser as PublicUser, { status: 201 });
}
