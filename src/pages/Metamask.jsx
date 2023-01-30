import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";
import Web3 from "web3";
import { requestForToken } from "../notification/firebase";
import Modal from "react-modal";
import "./pages_css/metamask.css";
var web3 = new Web3();
export default function MetaMask() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  requestForToken();

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
      toast.error("Email and Password is required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      const { username, password } = values;
      const { data } = await axios.post(loginRoute, {
        username,
        password,
      });
      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      }
      if (data.status === true) {
        localStorage.setItem(
          'chat-app-current-user',
          JSON.stringify(data.user)
        );

        navigate("/");
      }
    }
  };
  const metamaskLogin = async (event) => {
    let ethereum = window.ethereum;
    let web3 = window.web3;
    if (typeof ethereum !== "undefined") {
      const metamaskAddress = await ethereum.enable();
      // web3.then(res=>{
      if (metamaskAddress[0]) {
        localStorage.setItem("metamask", metamaskAddress[0]);
        navigate("/login");
      }
    } else {
      // alert("Please install Metamask")
      // toast.error("Please Install Metamask", toastOptions);
      setModalIsOpen(true);
      return false;
    }

    // const accounts = await Web3.eth.getAccounts();

    // const msg = 'hello world'
    // web3.eth.sign
    // const msgHash = web3.eth.accounts.hashMessage(msg);
    // const signature = await web3.eth.sign(accounts[0], msgHash);
    // web3.utils.toChecksumAddress('0x043A711a6eE1ffEed9EC41A57e12a81C24a932c7')
    // web3.eth.sign('0x043A711a6eE1ffEed9EC41A57e12a81C24a932c7', 'message', function (err, result) {
    //   window.alert('Message signed!')
    // })
  };
  const setModalIsOpenToFalse = () => {
    setModalIsOpen(false);
  };
  const customStyles = {
    overlay: {
      backgroundColor: '#6d4cd4'
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: " rgb(13, 13, 48)",
      color: "white",
    },
  };

  return (
    <>
      <div className="contain_form">
        <div className="mainclass">
          <div className="brand">
            <img className="brand-i-logo" src={Logo} alt="logo" />
            <h1>VAULTIO</h1>
          </div>

          <button className="first_button" onClick={metamaskLogin}>MetaMask Login</button>
        </div>
      </div>
      <ToastContainer />
      <Modal //className="custom_modal"

        isOpen={modalIsOpen}
        style={customStyles}
        onHide={setModalIsOpenToFalse}
      >
        <h4 onClick={setModalIsOpenToFalse}>Close</h4>
        <p className='mask_line'>Please Install Metamask</p>
        <p className='mask_line'>
          MetaMask Wallet Download For
          <a
            // href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
            href="https://metamask.io/download/"
            target="_blank"
            style={{ color: "White" }}
          >
            {" "}
            Click Here
          </a>
        </p>
      </Modal>
    </>
  );
}

// const Modal = styled.Modal`
// .ReactModal__Content--after-open{
//   background-color: #6d4cd4;
// }
// `;

