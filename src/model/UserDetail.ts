export interface UserDetailProps {
    userName: string;
    password: string;
    email?: string;
    isAdmin?: boolean;
}

/// This class is used for sign in, log in and profile edit
export default class UserDetail {
    userName: string;
    password: string;
    email?: string;
    isAdmin?: boolean;

    constructor(props: UserDetailProps) {
      this.userName = props.userName;
      this.password = props.password;
      this.email = props.email;
      this.isAdmin = props.isAdmin;
    }
}
