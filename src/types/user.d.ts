export {};

export type UserRole = "ADMIN" | "FIELD_MANAGER" | "OPERATOR";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginUser {
  email: string;
  password: string;
}

export type PublicUser = Omit<User, "password_hash">;
