import { DbRecord } from "./DbRecord";

export interface DbPost extends DbRecord {
  created_on: string;
  content: string;
  id: string;
}