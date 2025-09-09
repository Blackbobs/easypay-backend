import { College } from "#interface/college.js";
import { Department } from "#interface/deaprtment.js";
import { Role } from "#interface/role.js";

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
