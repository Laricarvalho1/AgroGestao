import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { UserRole } from "@/modules/users/user.entity";

export interface AuthPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export async function requireAdmin(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    if (decoded.role !== "ADMIN") return null;
    return decoded;
  } catch {
    return null;
  }
}