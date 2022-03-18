import { RouteComponentProps } from "react-router-dom";
import UserInfo from "../model/UserInfo.js";

export interface IBaseProps {
  user?: UserInfo;
  triggerUserReload?: () => void;
  setMessage: (message: string) => void;
  setErrors: (errors: Array<Error>) => void;
  setMessageBar: (message: string, errors: Array<Error>) => void;
}

export interface ExtendedIBaseProps extends IBaseProps, RouteComponentProps { }
