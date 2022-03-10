import { DbRecord } from "./DbRecord";

export interface DbPersonSecret extends DbRecord {
    id: string;
    person_id: string;
    salt: string;
    iv: string;
    secret: string;
    created_on: string;
}