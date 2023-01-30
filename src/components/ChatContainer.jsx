import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute, updateUser,msguserIdRemove } from "../utils/APIRoutes";
import { BsFillCloudDownloadFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import FileSaver from 'file-saver';
import Modal from 'react-modal';
import { triggerBase64Download } from 'common-base64-downloader-react';
import FileType from 'file-type';
import LoadingGIF from '../assets/download-gif.gif';
import CryptoJS from 'crypto-js';
import "./css/main.css";


export default function ChatContainer({ currentChat, socket, handleBlinking, isVisible }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [imageOpen, setImageOpen] = useState(false);
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const [file, setFile] = useState();
  const [gotFile, setGotFile] = useState(false);
  const [base64, setBase64] = useState();
  const [isShowLoader, showDownloadLoader] = useState();
  const [newchange, setNewchange] = useState(false);
  const [removeFileUploadId, setRemoveFileUploadId] = useState("");
  const [removeFileFirebaseUploadId, setRemoveFileFirebaseUploadId] = useState("");

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      background: ' rgb(13, 13, 48)',
      height: '70%',
      width: '70%',
      color: "white",
      inset: "50% auto auto 50%",
    },
  };

  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem('chat-app-current-user')
    );
    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    setMessages(response.data);
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem('chat-app-current-user')
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const setModalIsOpenToFalse = () => {
    setModalIsOpen(false)
  }

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem('chat-app-current-user')
    );

    if (!msg.includes("data:")) {
      await axios.post(sendMessageRoute, {
        from: data._id,
        to: currentChat._id,
        device_token: currentChat?.device_token,
        message: msg,
      }, (data) => {
        setNewchange(true);
        setRemoveFileUploadId(data.sender);
        setRemoveFileFirebaseUploadId(data.sender);
      });
    }

    await socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
    }, (data) => { });
    const currentUser = JSON.parse(localStorage.getItem('chat-app-current-user'));
    const response = await axios.post(updateUser, {
      id: currentUser._id,
      newMsgUserId: currentChat._id
    });
    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  const downloadIpfsFile = async (data, indexKey) => {
    showDownloadLoader(indexKey);
    var key;
    let currentUserMetaMaskPK = '';
    if (localStorage.getItem("chat-app-current-user")) {
      currentUserMetaMaskPK = JSON.parse(localStorage.getItem("chat-app-current-user")).metamask;
    }
    let currentChatWith = JSON.parse(localStorage.getItem("current-chat-with")).metamask;
    if (data.fromSelf == true) {
      key = currentUserMetaMaskPK + '_' + currentChatWith;
    } else {
      key = currentChatWith + '_' + currentUserMetaMaskPK;
    }

    var filecontent = await axios.get(`${data.message}`);
    var str = (filecontent.data);
    const decrypted = CryptoJS.AES.decrypt(filecontent.data, key);
    str = decrypted.toString(CryptoJS.enc.Utf8);
    const wordArray = CryptoJS.enc.Hex.parse(str);
    wordToByteArray(wordArray.words, wordArray.words.length);
  }

  function wordToByteArray(word, length) {
    let pushCode = [], xFF = 0xFF;
    word.forEach((item) => {
      if (length > 0)
        pushCode.push(item >>> 24);
      if (length > 1)
        pushCode.push((item >>> 16) & xFF);
      if (length > 2)
        pushCode.push((item >>> 8) & xFF);
      if (length > 3)
        pushCode.push(item & xFF);
    });
    const data = pushCode.slice(0, -1);
    const arrayBuffer = new ArrayBuffer(data.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < data.length; ++i) {
      uint8Array[i] = data[i];
    }
    saveFile(uint8Array);
  }

  function saveFile(uint8Array) {
    const mimeType = FileType(uint8Array);
    var blob = new Blob([uint8Array], { type: mimeType.mime });
    var digits = Math.floor(Math.random() * 9000000000) + 1000000000;
    FileSaver.saveAs(blob, digits + '.' + mimeType.ext);
    showDownloadLoader();
  }

  // const firebaseFileDownload=()=>{
  //   const mimeType = FileType("https://firebasestorage.googleapis.com/v0/b/messagingapp-3b949.appspot.com/o/files%2Flicense.png?alt=media&token=3e677b18-0fea-4e0b-b981-5273c066b7b9");
  //   var blob = new Blob([uint8Array], { type: mimeType.mime });
  //   var digits = Math.floor(Math.random() * 9000000000) + 1000000000;
  //   FileSaver.saveAs(blob, digits + '.' + mimeType.ext);
  // }

  const downloadSignedFile = (url) => {
    fetch(url)
      .then(response => {
        response.blob().then(blob => {
          let url = window.URL.createObjectURL(blob);
          let a = document.createElement('a');
          a.href = url;
          a.download = 'signed.pdf';
          a.click();
        });
        //window.location.href = response.url;
      });
  }

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", async(msg) => {
        // setArrivalMessage({ fromSelf: false, ...msg });
        console.log("nadeem",msg);
        if (msg.msg.includes("data:")) {
          setArrivalMessage({ fromSelf: false, ...msg });
          setGotFile(true);
          setBase64(msg.msg);
        }
        if (msg.msg == "yes") {
          handleSendMsg("Join Room");
          msg.msg = "Join Room"
          setArrivalMessage({ fromSelf: false, ...msg });
        }
        else{
          console.log("Coming");
          setArrivalMessage({ fromSelf: false, ...msg });
        }
        const data = await JSON.parse(
          localStorage.getItem('chat-app-current-user')
        );
        console.log(msg.to,data._id)
        if(msg.to  ==  data._id){
          // alert(msg.to,data._id)
          var msgRe = await axios.post(msguserIdRemove, {
            id: currentChat._id,
            newMsgUserId: data._id
          });
          console.log("msgRe",msgRe);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (arrivalMessage?.from === currentChat?._id) {
      arrivalMessage && setMessages((prev) => [...prev, { fromSelf: false, message: arrivalMessage.msg }]);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleShowDialog = () => {
    setImageOpen(!imageOpen);
  };

  const genrateCertificate = async (msg) => {
    localStorage.setItem('fileUrl', msg.message);
    localStorage.setItem('dateTimeFile', msg.createdAt)
    navigate('/genrateCertificate')
  }

  const modelOpne = () => {
    setModalIsOpen(true);
  }

  const createRoom = () => {
    setJoinRoom(true);
  }

  const selectFile = (e) => {
    setFile(e.target.files[0]);
  }

  const sendFile = async (e) => {
    const data = await JSON.parse(
      localStorage.getItem('chat-app-current-user')
    );
    let msg;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
      msg = reader.result;
      await socket.current.emit("send-msg", {
        to: currentChat._id,
        from: data._id,
        msg,
      });
    }
  }
  const closeRoomModel = () => {
    setModalIsOpen(false);
  }
  const setModalIsOpenToTrue = () => {
    navigate("/docUpload");
    // setModalIsOpen(true)
  };
  const downloadFileFirebase = (message) => {
    console.log("mes",message);
    window.open(message.message);
    // setModalIsOpen(true)
  };
  return (
    <Container className={isVisible ? "w_100" : ""} id="chatContainerID">
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img className="avt-img"
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        {/* <Logout /> */}
      </div>
      <div className="chat-messages">
        {messages.map((message, indexKey) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${message.fromSelf ? "sended" : "recieved"
                  }`}
              >
                <div className="content ">
                  {message.message.includes(".png") || message.message.includes(".jpeg") || message.message.includes(".jpg") ?
                    <div><img src={message.message} alt="" onClick={handleShowDialog} />
                      {/* <h3 style={{ marginTop: 16 }}>Certificate</h3>
                      <p style={{ textAlign: 'end' }}>
                        <BsFillCloudDownloadFill style={{ color: "#ffff00c8", cursor: "pointer", marginTop: 16, fontSize: 30 }}
                          onClick={() => genrateCertificate(message)} />
                      </p> */}
                      <p style={{"color": "orangered","font-size": "14px"}}>Note :- Please Download the File.<br /> The file will be deleted after 24 hours</p>
                      <a className="download-docs-text" onClick={() =>  downloadFileFirebase(message)} ><li className="download-docs">Download Image</li></a>
                      <a onClick={() =>  genrateCertificate(message)} className="download-docs-text"><li className="download-docs">Download Certificate</li></a>
                    </div> : [message.message.includes(".pdf") ?
                      <div> <a href={message.message} target="_blank" style={{ color: 'white' }}>{message.message}</a>
                        {/* <h3 style={{ marginTop: 16 }}>Certificate</h3> */}
                        {/* <p style={{ textAlign: 'end' }}>
                          <BsFillCloudDownloadFill style={{ color: "#ffff00c8", cursor: "pointer", marginTop: 16, fontSize: 30 }}
                            onClick={() => genrateCertificate(message)} />
                        </p> */}
                        <p style={{"color": "orangered","font-size": "14px"}}>Note :- Please Download the File.<br /> The file will be deleted after 24 hours</p>
                        <a className="download-docs-text" onClick={() =>  downloadFileFirebase(message)}><li className="download-docs">Download Pdf</li></a>
                        <a onClick={() =>  genrateCertificate(message)} className="download-docs-text"><li className="download-docs">Download Certificate</li></a>
                      </div> : message.message.includes(".webm") || message.message.includes(".mov") || message.message.includes(".mp4") ?
                        <div> <video alt="" height={'130px'} width={'240px'} controls><source src={message.message} /></video>
                          {/* <h3 style={{ marginTop: 16 }}>Certificate</h3>
                          <p style={{ textAlign: 'end' }}>
                            <BsFillCloudDownloadFill style={{ color: "#ffff00c8", cursor: "pointer", marginTop: 16, fontSize: 30 }}
                              onClick={() => genrateCertificate(message)} />
                          </p> */}
                          <p style={{"color": "orangered","font-size": "14px"}}>Note :- Please Download the File.<br /> The file will be deleted after 24 hours</p>
                          <a className="download-docs-text" onClick={() =>  downloadFileFirebase(message)}><li className="download-docs">Download Video</li></a>
                          <a onClick={() =>  genrateCertificate(message)} className="download-docs-text"><li className="download-docs">Download Certificate</li></a>
                        </div> : message.message.includes("data:image/") ?
                          <div><img src={message.message} alt="" height={'130px'} width={'240px'} onClick={handleShowDialog} /></div> : message.message.includes("data:video") ?
                            <div> <video alt="" height={'130px'} width={'240px'} controls><source src={message.message} /></video></div> : message.message.includes("data:application") ?
                              <div> <a href={message.message} target="_blank">Document Here</a> </div> : message.message.includes(".ipfs.nftstorage.link") ?
                                <div>
                                  <a href={message.message} target="_blank" style={{ color: 'white' }}>{message.message}</a>
                                  <p style={{ textAlign: 'end' }}>
                                    {isShowLoader === indexKey ? <img className="down-loader" src={LoadingGIF} /> :
                                      <BsFillCloudDownloadFill style={{ color: "#ffff00c8", cursor: "pointer", marginTop: 16, fontSize: 30 }}
                                        onClick={() => downloadIpfsFile(message, indexKey)} />}
                                  </p>
                                </div> : message.message.includes("Document Successfully Signed.") ?
                                  <div>
                                    <p>{message.message}</p>
                                    {/* <h3 style={{ marginTop: 16 }}>Certificate</h3> */}
                                    <a className="download-docs-text" onClick={() => downloadSignedFile(message.docUrl)}><li className="download-docs">Download Signed Docs</li></a>
                                    <a onClick={() => setModalIsOpenToTrue()} className="download-docs-text"><li className="download-docs">Download Certificate</li></a>
                                  </div> :
                                  message.message.includes("Join Room") ?
                                    <div> <p onClick={modelOpne}>Join Room</p> </div> : <p>{message.message}</p>]}
                  {imageOpen && (
                    <dialog
                      className="dialog"
                      style={{ position: "absolute" }}
                      open
                      onClick={handleShowDialog}
                    >
                      <img
                        className="image"
                        src={message.message}
                        onClick={handleShowDialog}
                        alt="no image"
                      />
                    </dialog>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput currentChat={currentChat} handleSendMsg={handleSendMsg} socket={socket} newchange={newchange} removeFileUploadId={removeFileUploadId} removeFileFirebaseUploadId={removeFileFirebaseUploadId} />
      <Modal isOpen={modalIsOpen} style={customStyles} onHide={setModalIsOpenToFalse}>
        <button style={{ backgroundColor: "rgb(78, 14, 255)", color: "white", padding: "1rem 2rem", border: "none", fontWeight: "bold", cursor: "pointer", borderRadius: "0.4rem", fontSize: "1rem", textTransform: "uppercase" }} onClick={createRoom}>Join Room</button>
        <button style={{ background: "red", color: "white", padding: "1rem 2rem", border: "none", fontWeight: "bold", cursor: "pointer", borderRadius: "0.4rem", fontSize: "1rem", textTransform: "uppercase", float: "right" }} onClick={closeRoomModel}>Close</button>
        {joinRoom ? <div style={{
          "position": "absolute",
          "inset": "40% auto auto 15%"
        }}>
          <input onChange={selectFile} type="file" style={{
            "backgroundColor": "rgb(78, 14, 255)",
            "color": "white",
            "padding": "1rem 2rem",
            "border": "none",
            "fontWeight": "bold",
            "cursor": "pointer",
            "borderRadius": "0.4rem",
            "fontSize": "1rem",
            "textTransform": "uppercase",
            "marginRight": "20px"
          }} />
          <button style={{
            "backgroundColor": "rgb(78, 14, 255)",
            "color": "white",
            "padding": "1rem 2rem",
            "border": "none",
            "fontWeight": "bold",
            "cursor": "pointer",
            "borderRadius": "0.4rem",
            "fontSize": "1rem",
            "textTransform": "uppercase"
          }} onClick={sendFile}>Send file</button>
        </div> : <div></div>}
        {gotFile ? <div style={{
          "position": "absolute",
          "inset": "65% auto auto 15%"
        }}>
          <span style={{ "color": "white", "marginRight": "10px" }}>You have received a file. Would you like to download the file?</span>
          <button onClick={() => triggerBase64Download(base64, 'my_download_name')} style={{
            "backgroundColor": "rgb(78, 14, 255)",
            "color": "white",
            "padding": "1rem 2rem",
            "border": "none",
            "fontWeight": "bold",
            "cursor": "pointer",
            "borderRadius": "0.4rem",
            "fontSize": "1rem",
            "textTransform": "uppercase"
          }}  >Yes</button>
        </div> : <div></div>}
      </Modal>
    </Container>

  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 3rem;
    background-color: #080420;
    @media screen and (max-width: 767px){
      width:100vw;
    }
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top:10px;
      .avatar {
        .avt-img {
          height: 3rem;
          @media screen and (max-width: 767px){
            height:2.5rem;
          }
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    @media screen and (max-width: 767px){
      width:100vw;
    }
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .dialog {
      box-shadow: 0 8px 6px -6px black;
      position: static;
      left: 50%;
      top: 10%;
    }
    
    .image {
      width: 300px;
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 100%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        color: #d1d1d1;
        display:inline-block;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 100%;
        }
        img{
          height:130px;
          width:240px;
          @media screen and (min-width: 720px) and (max-width: 1080px){
            width:100%;
            height:100%; 
          }
          @media screen and (max-width: 767px) {
            width:100%;
            height:100%;
          }
        }
      }
    }
    .sended {
      justify-content: flex-end;
      max-width:60%;
      display:inline-block;
      float:right;
      .content {
        background-color: #4f04ff21;
        border-radius: 35px 35px 0px 35px;
      }
    }
    .recieved {
      justify-content: flex-start;
      max-width:60%;
      display:block;
      .content {
        background-color: #9900ff20;
        border-radius: 35px 35px 35px 0px;
      }
    }
  }
  .w_100{
    
  }
`;
