import bcrypt from "bcryptjs";

export type UserRole = "ADMIN" | "FIELD_MANAGER" | "OPERATOR";

export interface UserDatabaseRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export class User {
  readonly id!: string;
  readonly name!: string;
  readonly email!: string;
  readonly role!: UserRole;
  readonly created_at!: Date;
  readonly updated_at!: Date;
  private password_hash!: string;

  constructor(data: UserDatabaseRow) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.password_hash = data.password_hash;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromDB(row: UserDatabaseRow | undefined): User | null {
    if (!row) return null;
    return new User(row);
  }

  async comparePassword(passwordToCheck: string): Promise<boolean> {
    return await bcrypt.compare(passwordToCheck, this.password_hash);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getRole(): UserRole {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }

  getUpdatedAt(): Date {
    return this.updated_at;
  }
}
