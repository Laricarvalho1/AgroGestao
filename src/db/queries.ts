import { CreateUserInput, User } from "@/types/user";

import { db } from "./db";
import { eq } from "drizzle-orm";

import * as schema from "./schema";

export async function createUser(
  user: CreateUserInput,
  password_hash: string,
): Promise<User> {
  return (
    await db
      .insert(schema.userTable)
      .values({ ...user, password_hash })
      .returning()
  )[0];
}

export async function getUserByEmail(email: string): Promise<User> {
  return (
    await db
      .select()
      .from(schema.userTable)
      .where(eq(schema.userTable.email, email))
  )[0];
}
