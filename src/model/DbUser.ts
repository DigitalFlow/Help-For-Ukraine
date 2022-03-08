export interface DbUserProps {
  email: string;
  password_hash: string;
  user_name: string;
  is_admin: boolean;
  id: string;
}

export default class DbUser {
  email: string;
  password_hash: string;
  user_name: string;
  is_admin: boolean;
  id: string;

  constructor (props: DbUserProps) {
    this.email = props.email;
    this.password_hash = props.password_hash;
    this.user_name = props.user_name;
    this.is_admin = props.is_admin;
    this.id = props.id;
  }
}
