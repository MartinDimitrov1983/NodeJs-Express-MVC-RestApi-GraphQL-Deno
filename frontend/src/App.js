import React, { useState, useEffect, Fragment } from "react";
import { withRouter } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import Backdrop from "./components/Backdrop/Backdrop";
import Toolbar from "./components/Toolbar/Toolbar";
import MainNavigation from "./components/Navigation/MainNavigation/MainNavigation";
import MobileNavigation from "./components/Navigation/MobileNavigation/MobileNavigation";
import ErrorHandler from "./components/ErrorHandler/ErrorHandler";
import Routes from "./Routes";
import { fetchData } from "./util/fetchData";
import { CREATE_USER, USER_LOGIN } from "./graphql/mutations";

import "./App.css";

const App = (props) => {
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setIsAuth(true);
    setToken(localStorageToken);
    setUserId(LocalStorageUserId);
    setAutoLogout(remainingMilliseconds);
  }, [token]);

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
    const graphqlQuery = {
      query: USER_LOGIN,
      variables: {
        email: authData.email,
        password: authData.password,
      },
    };
    setAuthLoading(true);

    fetchData(props.token, graphqlQuery)
      .then((resData) => {
        if (resData.errors && resData.errors[0].status === 401) {
          throw new Error("Validation failed. Check your password or email!");
        }
        if (resData.errors) {
          throw new Error("User login failed!");
        }

        setToken(resData.data.login.token);
        setUserId(resData.data.login.userId);
        setAuthLoading(false);
        setIsAuth(true);
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
        setIsAuth(false);
        setAuthLoading(false);
        setError(err);
      });
  };

  const signupHandler = (event, authData) => {
    event.preventDefault();
    setAuthLoading(true);

    const graphqlQuery = {
      query: CREATE_USER,
      variables: {
        email: authData.signupForm.email.value,
        name: authData.signupForm.name.value,
        password: authData.signupForm.password.value,
      },
    };

    fetchData(props.token, graphqlQuery)
      .then((resData) => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if (resData.errors) {
          throw new Error("User creation failed!");
        }
        setIsAuth(false);
        setAuthLoading(false);
        props.history.replace("/");
      })
      .catch((err) => {
        console.log(err);
        setIsAuth(false);
        setAuthLoading(false);
        setError(err);
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

  console.log("APP TOKEN", token);
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
        authLoading={authLoading}
        userId={userId}
        token={token}
        isAuth={isAuth}
        signupHandler={signupHandler}
      />
    </Fragment>
  );
};

export default withRouter(App);
