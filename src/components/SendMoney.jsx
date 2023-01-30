// import React from "react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";
import axios from "axios";
import { logoutRoute } from "../utils/APIRoutes";
import Web3 from 'web3';
import {  Modal, Form } from "react-bootstrap";

export default function SendMoney() {
    const [showpay, setShowpay] = useState(false);
    const handleClosePay = () => setShowpay(false);
    const handleShowPay = () => setShowpay(true);

    const sendMoney = async (e) => {
        var walletAddress =   document.getElementById("walletAddress").value
        var amount = document.getElementById("amount").value
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const weiValue = Web3.utils.toWei(amount, 'ether');
        await web3.eth.sendTransaction({to: walletAddress, from: accounts[0], value: weiValue});
        handleClosePay();
      }

  const navigate = useNavigate();
//   const handleClick = async () => {
//     const id = await JSON.parse(
//       localStorage.getItem('chat-app-current-user')
//     )._id;
//     const data = await axios.get(`${logoutRoute}/${id}`);
//     if (data.status === 200) {
//       localStorage.clear();
//       // window.ethereum.disconnect();
//       navigate("/metamask");
//     }
//   };
  return (
    <div>
    <Button variant="primary" onClick={handleShowPay}>
      Send Money
    </Button>
    <Modal show={showpay} onHide={handleClosePay}>
        <Modal.Header closeButton>
          <Modal.Title> Send Money </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              required
              id="walletAddress"
              size="text"
              type="text"
              placeholder="Enter The Wallet Address"
            />
            <br />
            <Form.Control
              required
              id="amount"
              size="number"
              type="number"
              placeholder="Amount"
            />
            <br />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePay}>
            Close
          </Button>
          <Button
            variant="primary"
            // onClick={() => {
            //   props.addHandler(
            //     document.getElementById("walletAddress").value,
            //     document.getElementById("amount").value
            //   );
            //   handleClosePay();
            // }}
            
            onClick={sendMoney}
          >
            Send Money
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
`;
