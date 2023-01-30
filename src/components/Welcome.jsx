import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";
export default function Welcome() {
  const [userName, setUserName] = useState("");
  useEffect(async () => {
    setUserName(
      await JSON.parse(
        localStorage.getItem('chat-app-current-user')
      )?.username
    );
  }, []);
  return (
    <Container>
      <div className="mobile_detail">
        <h1>
          Welcome, <span>{userName}!</span>
        </h1>
        <h3>Please select a chat to Start messaging.</h3>
      </div>
      <img className="gif-d" src={Robot} alt="" />
      <span className="user_name">{userName}!</span>
      <div className="desktop_detail">
        <h1>
          Welcome, <span>{userName}!</span>
        </h1>
        <h3>Please select a chat to Start messaging.</h3>
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  .gif-d {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;
