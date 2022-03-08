import { RouteComponentProps } from "react-router-dom";
import UserInfo from "../model/UserInfo.js";

export interface IBaseProps {
  user?: UserInfo;
  triggerUserReload?: () => void;
}

export interface ExtendedIBaseProps extends IBaseProps, RouteComponentProps { }
