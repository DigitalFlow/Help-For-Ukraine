export default class UserInfo {
  is_admin: boolean;
  user_name: string;
  email: string;
  created_on: string;
  id: string;

  // This is super important.
  // When logging in, a db user is passed in here and all private information must get lost in the conversion
  constructor(props: UserInfo) {
      this.is_admin = props.is_admin;
      this.user_name = props.user_name;
      this.email = props.email;
      this.created_on = props.created_on;
      this.id = props.id;
  }
}
