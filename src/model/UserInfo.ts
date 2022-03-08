export interface UserInfoProps {
  is_admin: boolean;
  user_name: string;
}

export default class UserInfo {
  is_admin: boolean;
  user_name: string;

  constructor(props: UserInfoProps) {
      this.is_admin = props.is_admin;
      this.user_name = props.user_name;
  }
}
