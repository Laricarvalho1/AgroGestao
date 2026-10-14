import { CreateUserInput } from "@/types/user";
import { db } from "./db";
import * as schema from "./schema";

export async function createUser(user: CreateUserInput, password_hash: string) {
  return (
    await db
      .insert(schema.userTable)
      .values({ ...user, password_hash })
      .returning()
  )[0];
}
