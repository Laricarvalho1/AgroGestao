import { LoginUserDTO } from "@/modules/users/login-user.dto";
import { RegisterUserDTO } from "@/modules/users/register-user.dto";

export async function createUser(user: RegisterUserDTO) {
  const payload = await fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      user,
    }),
  });
  return payload;
}

export async function login(loginInput: LoginUserDTO) {
  const payload = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      user: loginInput,
    }),
  });
  return payload;
}
