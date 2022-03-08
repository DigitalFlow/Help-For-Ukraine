import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { IBaseProps } from "../domain/IBaseProps";
import WelcomePage from "./WelcomePage";
import Login from "./Login";
import Logout from "./Logout";
import Profile from "./Profile";
import SignUp from "./SignUp";
import PortalManagement from "./PortalManagement";
import PostEdit from "./PostEdit";
import PersonFinder from "./PersonList";
import Person from "./Person";
import Impressum from "./Impressum";

export default class Main extends React.PureComponent<IBaseProps, undefined> {
  constructor(props: IBaseProps) {
      super(props);
  }

  render() {
    return (
      <main>
        <Switch>
          <Route exact path="/">
            <WelcomePage {...this.props} />
          </Route>
          <Route exact path="/index">
            <WelcomePage {...this.props} />
          </Route>
          <Route exact path="/person/:id">
            <Person {...this.props} />
          </Route>
          <Route exact path="/personFinder">
            <PersonFinder {...this.props} />
          </Route>
          <Route exact path="/login">
            <Login {...this.props} />
          </Route>
          <Route exact path="/logout">
            <Logout {...this.props} />
          </Route>
          <Route exact path="/profile/:id?">
            <Profile {...this.props} />
          </Route>
          <Route exact path="/signUp">
            <SignUp {...this.props} />
          </Route>
          <Route exact path="/impressum">
            <Impressum {...this.props} />
          </Route>
          <Route exact path="/portalManagement">
            <PortalManagement {...this.props} />
          </Route>
          <Route exact path="/post/:id">
            <PostEdit {...this.props} />
          </Route>
        </Switch>
      </main>
    );
  }
}
