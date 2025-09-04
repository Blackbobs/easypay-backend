import { College } from "#interface/college";
import { Department } from "#interface/deaprtment";
import { Role } from "#interface/role";

export interface loginDto {
  email: string;
  password: string;
}

export interface userDto {
  college: College;
  department: Department;
  email: string;
  password: string;
  role: Role;
  username: string;
}
