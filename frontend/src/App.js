import React, { useState, useEffect, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { useMutation, useLazyQuery, gql } from "@apollo/client";

import Layout from "./components/Layout/Layout";
import Backdrop from "./components/Backdrop/Backdrop";
import Toolbar from "./components/Toolbar/Toolbar";
import MainNavigation from "./components/Navigation/MainNavigation/MainNavigation";
import MobileNavigation from "./components/Navigation/MobileNavigation/MobileNavigation";
import ErrorHandler from "./components/ErrorHandler/ErrorHandler";
import Routes from "./Routes";
import { CREATE_USER } from "./graphql/mutations";
import { USER_LOGIN } from "./graphql/queries";

import "./App.css";

const App = (props) => {
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  const LOGIN = gql`
    ${USER_LOGIN}
  `;
  const SIGNUP = gql`
    ${CREATE_USER}
  `;
  const [
    userLogin,
    { data: loginData, loading: loginLoading, error: loginError },
  ] = useLazyQuery(LOGIN);
  const [
    userSignup,
    { data: signupData, loading: signupLoading, error: signupError },
  ] = useMutation(SIGNUP);

  useEffect(() => {
    const localStorageToken = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    if (!localStorageToken || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }
    const LocalStorageUserId = localStorage.getItem("userId");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    setIsAuth(!!localStorageToken);
    setToken(localStorageToken);
    setUserId(LocalStorageUserId);
    setAutoLogout(remainingMilliseconds);
  }, [token]);

  useEffect(() => {
    try {
      if (
        loginError?.graphQLErrors &&
        loginError?.graphQLErrors[0].status === 401
      ) {
        throw new Error("Validation failed. Check your password or email!");
      }
      if (loginError?.graphQLErrors) {
        throw new Error("User login failed!");
      }
      if (loginError) {
        throw new Error(loginError);
      }
    } catch (err) {
      console.log(err);
      setIsAuth(false);
      setError(loginError);
    }
  }, [loginError]);

  useEffect(() => {
    try {
      if (
        signupError?.graphQLErrors &&
        signupError?.graphQLErrors[0]?.status === 422
      ) {
        throw new Error(
          "Validation failed. Make sure the email address isn't used yet!"
        );
      }
      if (signupError?.graphQLErrors) {
        throw new Error("User creation failed!");
      }
      if (signupError) {
        throw new Error(signupError);
      }
    } catch (err) {
      console.log(err);
      setIsAuth(false);
      setError(err);
    }
  }, [signupError]);

  const mobileNavHandler = (isOpen) => {
    setShowBackdrop(isOpen);
    setShowMobileNav(isOpen);
  };

  const backdropClickHandler = () => {
    setShowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  };

  const logoutHandler = () => {
    setIsAuth(false);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");
  };

  const loginHandler = (event, authData) => {
    event.preventDefault();

    userLogin({
      variables: { email: authData.email, password: authData.password },
      onCompleted: (data) => {
        setToken(data.login.token);
        setUserId(data.login.userId);
        setIsAuth(true);
        localStorage.setItem("token", data.login.token);
        localStorage.setItem("userId", data.login.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem("expiryDate", expiryDate.toISOString());
        setAutoLogout(remainingMilliseconds);
      },
    });
  };

  const signupHandler = (event, authData) => {
    event.preventDefault();

    userSignup({
      variables: {
        email: authData.signupForm.email.value,
        name: authData.signupForm.name.value,
        password: authData.signupForm.password.value,
      },
      onCompleted: (data) => {
        setIsAuth(false);
        props.history.replace("/");
      },
    });
  };

  const setAutoLogout = (milliseconds) => {
    setTimeout(() => {
      logoutHandler();
    }, milliseconds);
  };

  const errorHandler = () => {
    setError(null);
  };

  return (
    <Fragment>
      {showBackdrop && <Backdrop onClick={backdropClickHandler} />}
      <ErrorHandler error={error} onHandle={errorHandler} />
      <Layout
        header={
          <Toolbar>
            <MainNavigation
              onOpenMobileNav={(e) => mobileNavHandler(true)}
              onLogout={logoutHandler}
              isAuth={isAuth}
            />
          </Toolbar>
        }
        mobileNav={
          <MobileNavigation
            open={showMobileNav}
            mobile
            onChooseItem={(e) => mobileNavHandler(false)}
            onLogout={logoutHandler}
            isAuth={isAuth}
          />
        }
      />
      <Routes
        loginHandler={loginHandler}
        authLoading={loginLoading || signupLoading}
        userId={userId}
        token={token}
        isAuth={isAuth}
        signupHandler={signupHandler}
      />
    </Fragment>
  );
};

export default withRouter(App);
