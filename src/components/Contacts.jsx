import axios from "axios";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import { msguserIdRemove } from "../utils/APIRoutes";
import Logout from "./Logout";

export default function Contacts({ contacts, changeChat, socket, isVisible }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [currentId, setCurrentId] = useState(undefined);

  useEffect(async () => {
    const data = await JSON.parse(localStorage.getItem('chat-app-current-user'));
    setCurrentUserName(data?.username);
    setCurrentUserImage(data?.avatarImage);
    setCurrentId(data?._id);
  }, []);

  const changeCurrentChat = async (index, contact) => {
    await axios.post(msguserIdRemove, {
      id: contact._id,
      newMsgUserId: currentId
    });

    changeChat(contact);
    setCurrentSelected(index);
  };

  return (
    <>
      {currentUserImage && currentUserImage && (
        <Container className={isVisible ? "w_0" : ""}>

          <div className="brand">
            <img src={Logo} className="brand-logo" alt="logo" />
            <h3>VAULTIO</h3>
          </div>
          <div className="contacts" id="line39">

            {contacts.map((contact, index) => {
              var userInNewMsg;
              if (contact.newMsgUserId) {

                const signResults = contact.newMsgUserId;
                userInNewMsg = (signResults.includes(currentId));
              }
              if (contact._id == currentId) {
                if (userInNewMsg) {
                  userInNewMsg = false
                }
              }
              return (
                <>
                  {userInNewMsg ? (

                    <div style={{ background: '#00c801d4' }}
                      key={contact._id}
                      className={`contact ${index === currentSelected ? "selected" : ""
                        }`}
                      onClick={() => changeCurrentChat(index, contact)}
                    >
                      <div className="avatar">
                        <img className="avtr-img"
                          src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                          alt=""
                        />
                      </div>
                      <div className="username">
                        <h3>{contact.username}</h3>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={contact._id}
                      className={`contact ${index === currentSelected ? "selected" : ""
                        }`}
                      onClick={() => changeCurrentChat(index, contact)}
                    >
                      <div className="avatar">
                        <img className="avtr-img"
                          src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                          alt=""
                        />
                      </div>
                      <div className="username">
                        <h3>{contact.username}</h3>
                      </div>
                    </div>
                  )
                  }
                </>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img className="avtr-img"
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username" style={{ "marginRight": "10px" }}>
              <h2>{currentUserName}</h2>
            </div>
            <Logout />
          </div>
        </Container>
      )}
    </>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  overflow: hidden;
  background-color: #080420;
  @media only screen and (max-width: 991px){
    width:100vw;
    position:relative;
    z-index:5;
    grid-template-rows: 7% 86% 7%;
  }
  @media screen and (max-width: 767px){
    grid-template-rows: 8% 84% 8%;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    .brand-logo {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: rgb(63 43 180 / 44%);
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem 30px;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      .avatar {
        .avtr-img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    border-radius: 60px;
    .avatar {
      .avtr-img {
        height: 2.5rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
        font-size:20px;
      }
    }
    @media screen and (max-width: 767px){
      gap: 4rem;
    }    
    @media screen and (min-width: 720px) and (max-width: 1080px) {      
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;
