import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";
import { auth } from "../firebase/firebase";
import "./pages_css/metamask.css";

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  useEffect(() => {
    if (localStorage.getItem('chat-app-current-user')) {
      navigate("/");
    }
  }, []);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    const { username, password } = values;
    if (username === "") {
      toast.error("Username and Password is required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Username and Password is required.", toastOptions);
      return false;
    }
    if (localStorage.getItem("metamask") == null) {
      toast.error("Metamask Address is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      const metamask = localStorage.getItem("metamask");
      const { username, password } = values;
      const { data } = await axios.post(loginRoute, {
        username,
        password,
        device_token: localStorage.getItem("device_token"),
        metamask,
      });
      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      }
      if (data.status === true) {
        // const loginData = auth.signInWithEmailAndPassword(data.user.email, password)
        // .then((loginUSer)=>{
        // })
        // .catch(error => {
        //   // setError("Error signing in with password and email!");
        //   console.error("Error signing in with password and email", error);
        // });
        auth
          .signInWithEmailAndPassword(data.user.email, password)
          .catch((error) => {
            // setError("Error signing in with password and email!");
            console.error("Error signing in with password and email", error);
          });
        localStorage.setItem(
          'chat-app-current-user',
          JSON.stringify(data.user)
        );

        navigate("/");
      }
    }
  };

  return (
    <>
      <div className="contain_form">
        <form action="" onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <img className="brand-i-logo" src={Logo} alt="logo" />
            <h1>VAULTIO</h1>
          </div>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={(e) => handleChange(e)}
            min="3"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={(e) => handleChange(e)}
          />
          <button type="submit">Log In</button>
          <span>
            Don't have an account ? <Link to="/register">Create One.</Link>
          </span>
        </form>
      </div>
      <ToastContainer />
    </>
  );
}


