import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import FeedPage from "./pages/Feed/Feed";
import SinglePostPage from "./pages/Feed/SinglePost/SinglePost";
import LoginPage from "./pages/Auth/Login";
import SignupPage from "./pages/Auth/Signup";
import "./App.css";

const Routes = ({
  loginHandler,
  authLoading,
  userId,
  token,
  isAuth,
  signupHandler,
  ...props
}) => {
  return (
    <Switch>
      <Route
        path="/"
        exact
        render={(props) =>
          !isAuth ? (
            <LoginPage
              {...props}
              onLogin={loginHandler}
              loading={authLoading}
            />
          ) : (
            <FeedPage userId={userId} token={token} />
          )
        }
      />
      <Route
        path="/signup"
        exact
        render={(props) =>
          !isAuth ? (
            <SignupPage
              {...props}
              onSignup={signupHandler}
              loading={authLoading}
            />
          ) : (
            <Redirect to="/" />
          )
        }
      />
      <Route
        path="/:postId"
        render={(props) =>
          isAuth ? (
            <SinglePostPage {...props} userId={userId} token={token} />
          ) : (
            <Redirect to="/" />
          )
        }
      />

      <Redirect to="/" />
    </Switch>
  );
};

export default Routes;
