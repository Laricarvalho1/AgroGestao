import { CreateUserInput } from "@/types/user";

export async function createUser(user: CreateUserInput) {
  const payload = await fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      user,
    }),
  });
  return payload;
}
