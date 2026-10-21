import { db } from "./db";
import { eq } from "drizzle-orm";

import * as schema from "./schema";
import { UserDatabaseRow } from "@/modules/users/user.entity";
import { RegisterUserDTO } from "@/modules/users/register-user.dto";

export async function createUser(
  user: RegisterUserDTO,
  password_hash: string,
): Promise<UserDatabaseRow> {
  return (
    await db
      .insert(schema.userTable)
      .values({
        name: user.name,
        email: user.email,
        role: user.role,
        password_hash,
      })
      .returning()
  )[0];
}

export async function getUserByEmail(email: string): Promise<UserDatabaseRow> {
  return (
    await db
      .select()
      .from(schema.userTable)
      .where(eq(schema.userTable.email, email))
  )[0];
}
