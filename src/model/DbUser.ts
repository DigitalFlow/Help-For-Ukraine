import { DbRecord } from "./DbRecord";

export interface DbUser extends DbRecord {
  email: string;
  password_hash: string;
  user_name: string;
  is_admin: boolean;
  id: string;
  created_on: string;
}
