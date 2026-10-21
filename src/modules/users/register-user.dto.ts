import { UserRole } from "./user.entity";

export class RegisterUserDTO {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;

  constructor(name: string, email: string, password: string, role: UserRole) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }
}
