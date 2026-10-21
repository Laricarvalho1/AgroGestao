import { User, UserRole } from "./user.entity";

export class ResponseUserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;

  private constructor(user: User) {
    this.id = user.getId();
    this.name = user.getName();
    this.email = user.getEmail();
    this.role = user.getRole();
    this.created_at = user.getCreatedAt();
    this.updated_at = user.getUpdatedAt();
  }

  static fromUser(user: User): ResponseUserDTO {
    return new ResponseUserDTO(user);
  }
}
