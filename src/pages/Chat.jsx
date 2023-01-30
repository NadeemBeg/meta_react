import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host,msguserIdRemove } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import MenuBar from "../assets/menu.png"
import './Chat.css';

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isVisible, setIsVisible] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [windowDimensions, setWindowDimensions] = useState(window);

  useEffect(() => {
    // if (localStorage.getItem('current-chat-with')) {
    //   handleChatChange(JSON.parse(localStorage.getItem('current-chat-with')));
    // }
    hideShow();
    function handleResize() {
      setWindowDimensions(window);
      hideShow();
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(async () => {
    if (!localStorage.getItem('chat-app-current-user')) {
      navigate("/metamask");
    } else {
      setCurrentUser(
        await JSON.parse(
          localStorage.getItem('chat-app-current-user')
        )
      );
    }
  }, []);
  useEffect(() => {
    socket.current = io(host);
    if (currentUser) {
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve",async(msg) => {
        console.log("msg 56 chat ",msg);

        const data = await JSON.parse(
          localStorage.getItem('chat-app-current-user')
        );
        const currentChat = await JSON.parse(
          localStorage.getItem('current-chat-with')
        );
        console.log(msg.to,data._id)
        if(msg.to  ==  data._id){
          console.log(currentChat)
          var msgRe = await axios.post(msguserIdRemove, {
            id: currentChat._id,
            newMsgUserId: data._id
          });
          console.log("msgRe",msgRe);
          setTimeout(async () => {
            await handleBlinking();
          }, 1000);
        }
        else{

          setTimeout(async () => {
            await handleBlinking();
          }, 1000);
        }
      });
    }
  }, [socket.current]);
  useEffect(async () => {
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        var data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        data.data = data.data.filter((item) => currentUser._id != item._id);
        setUnreadCount(data.data);
        setContacts(data.data);
      } else {
        navigate("/setAvatar");
      }
    }
  }, [currentUser]);
  const handleBlinking = async () => {
    var id = JSON.parse(localStorage.getItem("chat-app-current-user"));
    id = id._id;
    var data = await axios.get(`${allUsersRoute}/${id}`);
    data.data = data.data.filter((item) => id != item._id);
    setUnreadCount(data.data);
    setContacts(data.data);
  };

  const setUnreadCount = (data) => {
    var id = JSON.parse(localStorage.getItem("chat-app-current-user"));
    id = id._id;
    let count = 0;
    setMsgCount(count);
    data.map((item) => {
      if (item.newMsgUserId.length > 0 && item.newMsgUserId.includes(id)) {
        count += 1;
        setMsgCount(count);
      }
    })
  }

  const handleChatChange = async (chat) => {
    localStorage.setItem('current-chat-with', JSON.stringify(chat));
    setCurrentChat(chat);
    if (chat.newMsgUserId.length > 0) {
      var data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
      data.data = data.data.filter((item) => currentUser._id != item._id);
      setUnreadCount(data.data);
      setContacts(data.data);
    }
    hideShow();
  };

  const hideShow = (flag = '') => {
    if (flag) {
      setIsVisible(!isVisible);
    } else if (windowDimensions.innerWidth > 760) {
      setIsVisible(isVisible);
    } else {
      setIsVisible(!isVisible);
    }
  }

  return (
    <>
      <Container>
        {/* <button onClick={hideShow}>ok</button> */}
        <div className={isVisible ? "container w_c" : "container"}>
          <button className="w_btn" onClick={() => hideShow('click')}>
            <img className="menuBarCls" src={MenuBar} />
            {
              msgCount ? <div className="count-bg"><span>{msgCount}</span></div> : ''
            }
          </button>
          <Contacts contacts={contacts} changeChat={handleChatChange} isVisible={isVisible} />
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} isVisible={isVisible} />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #6d4cd4;
  .container {
    height: 100vh;
    width: 100vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
