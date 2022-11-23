import React, { useState, useEffect, Fragment } from "react";
import {
  Route,
  Switch,
  Redirect,
  withRouter,
} from "react-router-dom";

import Layout from "./components/Layout/Layout";
import Backdrop from "./components/Backdrop/Backdrop";
import Toolbar from "./components/Toolbar/Toolbar";
import MainNavigation from "./components/Navigation/MainNavigation/MainNavigation";
import MobileNavigation from "./components/Navigation/MobileNavigation/MobileNavigation";
import ErrorHandler from "./components/ErrorHandler/ErrorHandler";
import FeedPage from "./pages/Feed/Feed2";
import SinglePostPage from "./pages/Feed/SinglePost/SinglePost2";
import LoginPage from "./pages/Auth/Login2";
import SignupPage from "./pages/Auth/Signup2";
import "./App.css";

const App = (props) => {
  const [state, setState] = useState({
    showBackdrop: false,
    showMobileNav: false,
    isAuth: false,
    token: null,
    userId: null,
    authLoading: false,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }
    const userId = localStorage.getItem("userId");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    setState({ isAuth: true, token: token, userId: userId });
    setAutoLogout(remainingMilliseconds);
  }, []);

  const mobileNavHandler = (isOpen) => {
    setState({ showMobileNav: isOpen, showBackdrop: isOpen });
  };

  const backdropClickHandler = () => {
    setState({ showBackdrop: false, showMobileNav: false, error: null });
  };

  const logoutHandler = () => {
    setState({ isAuth: false, token: null });
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");
  };

  const loginHandler = (event, authData) => {
    event.preventDefault();
    const graphqlQuery = {
      query: `
        query UserLogin($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
            userId
          }
        }
      `,
      variables: {
        email: authData.email,
        password: authData.password,
      },
    };
    setState({ authLoading: true });
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if (resData.errors) {
          throw new Error("User login failed!");
        }
        setState({
          isAuth: true,
          token: resData.data.login.token,
          authLoading: false,
          userId: resData.data.login.userId,
        });
        localStorage.setItem("token", resData.data.login.token);
        localStorage.setItem("userId", resData.data.login.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem("expiryDate", expiryDate.toISOString());
        setAutoLogout(remainingMilliseconds);
      })
      .catch((err) => {
        console.log(err);
        setState({
          isAuth: false,
          authLoading: false,
          error: err,
        });
      });
  };

  const signupHandler = (event, authData) => {
    event.preventDefault();
    setState({ authLoading: true });
    const graphqlQuery = {
      query: `
        mutation CreateUser($email: String!, $name: String!, $password: String!) {
          createUser(userInput: {email: $email, name: $name, password: $password}) {
            _id
            email
          }
        }
      `,
      variables: {
        email: authData.signupForm.email.value,
        name: authData.signupForm.name.value,
        password: authData.signupForm.password.value,
      },
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if (resData.errors) {
          throw new Error("User creation failed!");
        }
        setState({ isAuth: false, authLoading: false });
        props.history.replace("/");
      })
      .catch((err) => {
        console.log(err);
        setState({
          isAuth: false,
          authLoading: false,
          error: err,
        });
      });
  };

  const setAutoLogout = (milliseconds) => {
    setTimeout(() => {
      logoutHandler();
    }, milliseconds);
  };

  const errorHandler = () => {
    setState({ error: null });
  };

  let routes = (
    <Switch>
      <Route
        path="/"
        exact
        render={(props) => (
          <LoginPage
            {...props}
            onLogin={loginHandler}
            loading={state.authLoading}
          />
        )}
      />
      <Route
        path="/signup"
        exact
        render={(props) => (
          <SignupPage
            {...props}
            onSignup={signupHandler}
            loading={state.authLoading}
          />
        )}
      />
      <Redirect to="/" />
    </Switch>
  );
  if (state.isAuth) {
    routes = (
      <Switch>
        <Route
          path="/"
          exact
          render={(props) => (
            <FeedPage userId={state.userId} token={state.token} />
          )}
        />
        <Route
          path="/:postId"
          render={(props) => (
            <SinglePostPage
              {...props}
              userId={state.userId}
              token={state.token}
            />
          )}
        />
        <Redirect to="/" />
      </Switch>
    );
  }
  return (
    <Fragment>
      {state.showBackdrop && <Backdrop onClick={backdropClickHandler} />}
      <ErrorHandler error={state.error} onHandle={errorHandler} />
      <Layout
        header={
          <Toolbar>
            <MainNavigation
              onOpenMobileNav={(e) => mobileNavHandler(true)}
              onLogout={logoutHandler}
              isAuth={state.isAuth}
            />
          </Toolbar>
        }
        mobileNav={
          <MobileNavigation
            open={state.showMobileNav}
            mobile
            onChooseItem={(e) => mobileNavHandler(false)}
            onLogout={logoutHandler}
            isAuth={state.isAuth}
          />
        }
      />
      {routes}
    </Fragment>
  );
};

export default withRouter(App);
