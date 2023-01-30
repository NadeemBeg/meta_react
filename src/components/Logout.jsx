import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";
import axios from "axios";
import { logoutRoute } from "../utils/APIRoutes";
export default function Logout() {

  const navigate = useNavigate();

  const handleClick = async () => {
    const id = await JSON.parse(localStorage.getItem("chat-app-current-user"))._id;
    const data = await axios.get(`${logoutRoute}/${id}`);
    if (data.status === 200) {
      const deviceToken = localStorage.getItem('device_token');
      const ipAddress = localStorage.getItem('ip');
      const metamask = localStorage.getItem('metamask');
      localStorage.clear();
      localStorage.setItem('device_token', deviceToken);
      localStorage.setItem('ip', ipAddress);
      localStorage.setItem('metamask', metamask);
      navigate("/login");
    }
  };

  return (
    <Button onClick={handleClick}>
      <BiPowerOff />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background:none;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
`;
