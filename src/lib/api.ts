import { CreateUserInput, LoginUser } from "@/types/user";

export async function createUser(user: CreateUserInput) {
  const payload = await fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      user,
    }),
  });
  return payload;
}

export async function login(loginInput: LoginUser) {
  const payload = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      user: loginInput,
    }),
  });
  return payload;
}
