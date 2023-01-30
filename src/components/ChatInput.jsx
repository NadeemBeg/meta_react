import React, { useState, useRef, useEffect } from "react";
import {
  BsEmojiSmileFill,
  BsFillPlusCircleFill,
  BsFillPenFill,
  BsPaypal,
  BsFillFileArrowUpFill,
  BsCollectionFill,
  BsFillCloudDownloadFill,
} from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import { Button } from "react-bootstrap";
import Web3 from "web3";
import { recieveMessageRoute } from "../utils/APIRoutes";
import axios from "axios";
import Modal from "react-modal";
import AnimeList from "./Welcome";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase/firebase";
import { Web3Storage } from "web3.storage";
import { v4 as uuidv4 } from "uuid";
import "./ChatInput.css";
import { NFTStorage } from "nft.storage";
import CryptoJS from "crypto-js";
import LoadingGIF from "../assets/download-gif.gif";
import FileType from "file-type";
import FileSaver from "file-saver";
import emoji from "../assets/emoji.svg";
import file_browser from "../assets/file_upload_browser.svg";
import file_ftp from "../assets/file_upload_ftp.svg";
import send_receive from "../assets/send_receive.svg"
import edit from "../assets/edit.svg"
import money from "../assets/ethereum.svg"
import "./css/main.css";

const client1 = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDYyZUI4N0YyOGI0MGM2YmEwMEE4ZkZCMDJhMUZCZGQ5OTU0RjIyNTciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3MjM4MDkwNDgzMiwibmFtZSI6IndhbGxldCJ9.m9s6Em7l8ZlhjSIzEUHo9fK2yuiYUQplXhzSMHoum8Y",
});


export default function ChatInput({ currentChat, handleSendMsg, socket, newchange, removeFileUploadId, removeFileFirebaseUploadId }) {

  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedFile, setCompressedFile] = useState(null);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const [transferredFileSize, setTransferredFileSize] = useState(0);
  const [timerForFile, setTimerForFile] = useState(0);
  const [isLoadingForIpfs, setIsLoadingForIpfs] = useState(false);
  const [allIpfsFile, setAllIpfsFile] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [allsendIPFSLink, setAllsendIPFSLink] = useState([]);
  const [allreceiveIPFSLink, setAllreceiveIPFSLink] = useState([]);
  const scrollRef = useRef();
  const [arrayBuffer, setArrayBuffer] = useState();
  const [isShowLoader, showDownloadLoader] = useState();
  const [isShowLoaderR, showDownloadLoaderR] = useState();
  const [progessV, setProgessV] = useState();
  const [tempUserFileSend, setTempUserFileSend] = useState([]);
  const [tempUserFileSendFirebase, setTempUserFileSendFirebase] = useState([]);
  const [fileSizeAndUpload, setFileSizeAndUpload] = useState(false);
  const [directFileIpfs, setDirectFileIpfs] = useState(false);
  const [fileHoleData, setFileHoleData] = useState();



  useEffect(() => {
    let temp = [...tempUserFileSend];
    temp.filter((item) => item == currentChat._id);
    setTempUserFileSend(temp);

    let temp2 = [...tempUserFileSendFirebase];
    temp2.filter((items) => items == currentChat._id);
    setTempUserFileSendFirebase(temp2);
  }, [removeFileUploadId, removeFileFirebaseUploadId])


  // Construct with token and endpoint
  const client = new Web3Storage({
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDNlOThEZjI5N2E0RWIwNjc5NzdEQjE0REJBODVjZGE2RjIxN0JDOTUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Njg0OTM2MzMwNjMsIm5hbWUiOiJXYWxsZXRQcm9qZWN0In0.99yjgTqfLKEKnB-WUGSLlyrkkuevV6avP4WNLoTeQq4",
  });
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const setModalIsOpenToTrue = () => {
    navigate("/docUpload");
    // setModalIsOpen(true)
  };

  const setModalIsOpenToFalse = () => {
    setModalIsOpen(false);
  };

  const customStyles = {
    overlay: {
      zIndex: "10",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: " #6d4cd4",
      height: "70%",
      width: "70%",
      color: "white",
      inset: "50% auto auto 50%",
    },
    sended: {
      justifyContent: "flex-end",
    },
    recieved: {
      justifyContent: "flex-start",
    },
  };
  const customStylesForIpfsUpload = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: " #6d4cd4",
      height: "25%",
      width: "65%",
      color: "white",
      inset: "50% auto auto 50%",
    },
    noClass: {
      float: "right",
      backgroundColor: "red",
      border: "none",
      color: "white",
      height: "20%",
      width: "15%",
      borderRadius: "5px"
    },
    yesClass: {
      // float: "right",
      backgroundColor: "green",
      border: "none",
      color: "white",
      height: "20%",
      width: "15%",
      borderRadius: "5px"
    },
  };

  const handleEmojiClick = (event, emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };
  const sendMsgForP2pAv = async () => {
    await handleSendMsg("Send Peer to Peer file Please Take It.");
    // document.getElementById("icon-button-file-p2p").click();
  };

  const sendMoney = async (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      var checkString = /^(\d*\.)?\d+$/;
      if (checkString.test(msg)) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const weiValue = Web3.utils.toWei(msg, "ether");
        await web3.eth.sendTransaction({
          to: currentChat.metamask,
          from: accounts[0],
          value: weiValue,
        });
        var msgWithEther = `Send ${msg} Ether`;
        handleSendMsg(msgWithEther);
      }
      setMsg("");
    }
  };

  const sendFile = async (event) => {
    event.preventDefault();

    const file = event.target.files[0];
    let gbValue = (file.size / (1000 * 1000 * 1000)).toFixed(2);
    if (1 > Number(gbValue)) {
      setIsLoading(true);

      let temp = [...tempUserFileSendFirebase];
      temp.push(currentChat._id);
      setTempUserFileSendFirebase(temp);

      const formdata = new FormData();
      formdata.append("name", file);
      const sotrageRef = ref(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(sotrageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setTotalFileSize(snapshot.totalBytes);
          setTransferredFileSize(snapshot.bytesTransferred);
          var a =
            Number(
              (
                (snapshot.totalBytes - snapshot.bytesTransferred) /
                (1000 * 1000)
              ).toFixed(2)
            ) / 10;
          setTimerForFile(a.toFixed(2));
          setProgress(prog);
        },
        (error) => console.log("error", error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            if (downloadURL) {
              //---------------------------------metamask signature --------------------
              // let provider;
              // window.ethereum.request({method:"eth_accounts"})
              // .then((result)=>{})
              // .catch((err)=>{
              //     console.log("err",err);
              //     setIsLoading(false)
              // })
              // provider = new ethers.providers.Web3Provider(window.ethereum)

              // const signer = provider.getSigner()
              // let signature = await signer.signMessage(downloadURL)
              // let address = ethers.utils.verifyMessage(downloadURL,signature);
              //--------------------------------- metamask signature --------------------
              await handleSendMsg(downloadURL);
              let temp = [...tempUserFileSendFirebase];
              let filterVar = temp.filter((item) => item == currentChat._id);
              setTempUserFileSendFirebase(filterVar);
              setIsLoading(false);
            }
          });
        }
      );

      // const savefileData =  await axios.post(savefile,formdata, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //     "Accept":"*"
      //   }

      // });
    } else {
      toast.error("File size should be less than 1 GB.", toastOptions);
      return false;
    }

    // if(event.target.files[0]){
    //   new Compressor(event.target.files[0], {
    //     quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
    //     success: (compressedResult) => {
    //       // setCompressedFile(compressedResult);

    //     },
    //     error(err) {
    //       console.log(err.message);
    //     },
    //   });

    // }

    // if (msg.length > 0) {
    //   var checkString = /^[0-9]+$/;
    //   if (checkString.test(msg)) {
    //     const web3 = new Web3(window.ethereum);
    //     const accounts = await web3.eth.getAccounts();
    //     const weiValue = Web3.utils.toWei(msg, 'ether');
    //     await web3.eth.sendTransaction({ to: currentChat.metamask, from: accounts[0], value: weiValue });
    //     var msgWithEther = `Send ${msg} Ether`;
    //     handleSendMsg(msgWithEther);
    //   }
    //   setMsg("");
    // }
  };
  const p2pSendFile = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    let document;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
      document = reader.result;
      await handleSendMsg(document);
    };
  };
  const sendFileUsingIpfs = async (event) => {
    const file = event.target.files[0];
    let mbValue = (file.size / (1000 * 1000)).toFixed(2);
    if (Number(mbValue) > 20) {
      // toast.error("File size should be less than 20 MB.", toastOptions);
      setFileSizeAndUpload(true);
      setFileHoleData(file);



    }
    else {
      setIsLoadingForIpfs(true);
      let temp = [...tempUserFileSend];
      temp.push(currentChat._id);
      setTempUserFileSend(temp);
      // const fileObj = event.target.files[0];

      // var reader = new FileReader();
      // reader.readAsDataURL(fileObj);
      // reader.onload = async function () {
      //     // const metadata =await client1.store({
      //     //   name: 'Pinpie',
      //     //   description: 'Pin is not delicious beef!',
      //     //   image: new File(
      //     //     [
      //     //       reader.result
      //     //     ],
      //     //     fileObj.name,
      //     //     { type: 'image/*' }
      //     //   ),
      //     // })
      //     const someData = new Blob([reader.result])
      //     const { car } = await NFTStorage.encodeBlob(someData)
      //     const cid = await client1.storeCar(car);
      //     setAllIpfsFile(false);
      //   };

      let arrayBuffer;

      const fileObj = event.target.files[0];
      let fileReader = new FileReader();
      fileReader.onload = function (e) {
        // arrayBuffer = e.target.result;
        // callEncrypt(arrayBuffer);
      }
      fileReader.onprogress = function (progessBar) {
        var a = Math.round((progessBar.loaded / progessBar.total) * 100);
        setProgessV(a);
      }
      fileReader.onloadend = function (doneFile) {
        var a = Math.round((doneFile.loaded / doneFile.total) * 100);
        setProgessV(a);
        arrayBuffer = doneFile.target.result;
        callEncrypt(arrayBuffer);
        // setIsLoadingForIpfs(false);
      }

      fileReader.readAsArrayBuffer(fileObj);
    }
  };

  useEffect(async () => {
    if (directFileIpfs) {
      setIsLoadingForIpfs(true);
      let temp = [...tempUserFileSend];
      temp.push(currentChat._id);
      setTempUserFileSend(temp);
      const fileObj = fileHoleData;
      let fileReader = new FileReader();
      fileReader.onload = function (e) {
        // arrayBuffer = e.target.result;
        // callEncrypt(arrayBuffer);
      }
      fileReader.onprogress = function (progessBar) {
        var a = Math.round((progessBar.loaded / progessBar.total) * 100);
        setProgessV(a);
      }
      fileReader.onloadend = function (doneFile) {
        var a = Math.round((doneFile.loaded / doneFile.total) * 100);
        setProgessV(a);
        // arrayBuffer = doneFile.target.result;
        // callEncrypt(arrayBuffer);
        // setIsLoadingForIpfs(false);
      }

      fileReader.readAsArrayBuffer(fileHoleData);
      const someData = new Blob([fileHoleData])
      const { car } = await NFTStorage.encodeBlob(someData);
      const cid = await client1.storeCar(car);
      await handleSendMsg('https://' + cid + '.ipfs.nftstorage.link');
      let temp2 = [...tempUserFileSend];
      let filterVar = temp2.filter((item) => item == currentChat._id);
      setTempUserFileSend(filterVar);
      setIsLoadingForIpfs(false);
      // setDirectFileIpfs(false);
    }
  }, [directFileIpfs])


  async function callEncrypt(arrayBuffer) {
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
    const str = CryptoJS.enc.Hex.stringify(wordArray);

    let currentUserMetaMaskPK = "";
    if (localStorage.getItem("chat-app-current-user")) {
      currentUserMetaMaskPK = JSON.parse(
        localStorage.getItem("chat-app-current-user")
      ).metamask;
    }
    let currentChatWith = JSON.parse(
      localStorage.getItem("current-chat-with")
    ).metamask;
    var key = currentUserMetaMaskPK + "_" + currentChatWith;

    let ct = CryptoJS.AES.encrypt(str, key); // SenderPK_ReceiverPK
    let ctstr = ct.toString();

    let testBuffer = new Buffer(ctstr);
    const someData = new Blob([testBuffer])
    const { car } = await NFTStorage.encodeBlob(someData);
    const cid = await client1.storeCar(car);
    await handleSendMsg('https://' + cid + '.ipfs.nftstorage.link');
    let temp = [...tempUserFileSend];
    let filterVar = temp.filter((item) => item == currentChat._id);
    setTempUserFileSend(filterVar);
    setIsLoadingForIpfs(false);

  }

  const ipfsAllFileShow = async (event) => {
    setAllIpfsFile(true);
    setAllsendIPFSLink([]);
    setAllreceiveIPFSLink([]);
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    const data = await JSON.parse(
      localStorage.getItem('chat-app-current-user')
    );
    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    // setAllIPFSLink(response.data)
    const messages = response.data;
    var arrsendIpfs = [];
    var arrreceiveIpfs = [];
    {
      messages.map(async (message) => {
        if (message.message.includes(".ipfs.nftstorage.link")) {
          // var msgSplit = message.message.split("ipfs.w3s.link/");
          var hours = new Date(message.createdAt).getHours() % 12;
          if (hours < 10) {
            hours = "0" + hours;
          }
          var min = new Date(message.createdAt).getMinutes();
          if (min < 10) {
            min = "0" + min;
          }
          var date =
            new Date(message.createdAt).toDateString() +
            "   " +
            hours +
            ":" +
            min;
          // new Date("2022-12-20T07:30:18.792Z").toDateString()
          if (message.fromSelf == true) {
            var message = {
              // fileName: msgSplit[1],
              // message: msgSplit[0] + 'ipfs.w3s.link',
              message: message.message,
              createdAt: date,
              fromSelf: message.fromSelf,
            };
            arrsendIpfs.push(message);
          } else {
            var message = {
              // fileName: msgSplit[1],
              // message: msgSplit[0] + 'ipfs.w3s.link',
              message: message.message,
              createdAt: date,
              fromSelf: message.fromSelf,
            };
            arrreceiveIpfs.push(message);
          }
        }
      });
    }
    if (arrsendIpfs.length > 0) {
      setAllsendIPFSLink(arrsendIpfs);
    } else {
      var message = [
        {
          message: "Send Files Not Found",
          fromSelf: true,
        },
      ];
      setAllsendIPFSLink(message);
    }
    if (arrreceiveIpfs.length > 0) {
      setAllreceiveIPFSLink(arrreceiveIpfs);
    } else {
      var message = [
        {
          message: "Receive Files Not Found",
          fromSelf: false,
        },
      ];
      setAllreceiveIPFSLink(message);
    }
  };
  const ipfsAllFilsModelOff = async (event) => {
    setAllIpfsFile(false);
  };
  const downloadIpfsFile = async (data, indexKey) => {
    // showDownloadLoader(indexKey);
    var key;
    let currentUserMetaMaskPK = "";
    if (localStorage.getItem("chat-app-current-user")) {
      currentUserMetaMaskPK = JSON.parse(
        localStorage.getItem("chat-app-current-user")
      ).metamask;
    }
    let currentChatWith = JSON.parse(
      localStorage.getItem("current-chat-with")
    ).metamask;
    if (data.fromSelf == true) {
      showDownloadLoader(indexKey);
      key = currentUserMetaMaskPK + "_" + currentChatWith;
    } else {
      showDownloadLoaderR(indexKey);
      key = currentChatWith + "_" + currentUserMetaMaskPK;
    }

    var filecontent = await axios.get(`${data.message}`);
    var str = filecontent.data;
    const decrypted = CryptoJS.AES.decrypt(filecontent.data, key);
    str = decrypted.toString(CryptoJS.enc.Utf8);
    const wordArray = CryptoJS.enc.Hex.parse(str);
    wordToByteArray(wordArray.words, wordArray.words.length);
  };

  function wordToByteArray(word, length) {
    let pushCode = [],
      xFF = 0xff;
    word.forEach((item) => {
      if (length > 0) pushCode.push(item >>> 24);
      if (length > 1) pushCode.push((item >>> 16) & xFF);
      if (length > 2) pushCode.push((item >>> 8) & xFF);
      if (length > 3) pushCode.push(item & xFF);
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
    FileSaver.saveAs(blob, digits + "." + mimeType.ext);
    showDownloadLoader();
    showDownloadLoaderR();
  }
  const yesFileUpload20Up = async (event) => {
    setDirectFileIpfs(true);
    setFileSizeAndUpload(false);
  }
  const noFileUpload20Up = async (event) => {
    setFileSizeAndUpload(false);
  }
  return (
    <>
      {isLoading && tempUserFileSendFirebase.includes(currentChat._id) ? (

        <Container>
          <h4 style={{ color: "white" }}>Uploading done {progress}%</h4>
          <h4 style={{ color: "white" }}>File Size {totalFileSize} </h4>
          <h4 style={{ color: "white" }}>
            File Transfer {transferredFileSize}{" "}
          </h4>
          <h4 style={{ color: "white" }}>Timer {timerForFile} </h4>
        </Container>
      ) : isLoadingForIpfs && !newchange && tempUserFileSend.includes(currentChat._id) ? (
        <Container>
          <h4 style={{ color: 'white' }}>File Uploading on IPFS Please Wait .. {progessV} %</h4>
        </Container>
      ) : (
        <Container>
          <div className="button-container">
            <div className="emoji">
              {/* <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} /> */}
              <img src={emoji} onClick={handleEmojiPickerhideShow} />
              {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
              <span className="emojiText">Select Emoji</span>
              {/* {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />} */}
            </div>
          </div>

          <div className="button-container">
            <div className="emoji fileSelection emojiSelection">
              {/* <BsFillPlusCircleFill /> */}

              <input
                accept="image/*"
                id="icon-button-file"
                type="file"
                style={{ display: "none" }}
                onChange={sendFile}
              />

              {/* <button onClick={setModalIsOpenToTrue} style={{ background: "#080420"}} > <BsFillPenFill/> </button> */}
              <label htmlFor="icon-button-file">
                {/* <BsFillPlusCircleFill /> */}
                <img src={file_browser} accept="*"/>
                <span className="emojiText">Upload File On Firebase</span>
              </label>
            </div>
          </div>
          <div className="button-container">
            <div className="emoji">
              {/* <BsFillPlusCircleFill /> */}
              <input
                id="icon-button-file-ipfs"
                type="file"
                style={{ display: "none" }}
                onChange={sendFileUsingIpfs}
              />
              {/* <button onClick={setModalIsOpenToTrue} style={{ background: "#080420"}} > <BsFillPenFill/> </button> */}
              <label htmlFor="icon-button-file-ipfs">
                {/* <BsFillFileArrowUpFill /> */}
                <img src={file_ftp} />
                <span className="emojiText">Upload File On IPFS</span>
              </label>
            </div>
          </div>
          {/* <div className="button-container">
            <div className="emoji">
              
              <input
                accept="image/*"
                id="icon-button-file-p2p"
                type="file"
                style={{ display: "none" }}
                onChange={p2pSendFile}
              />
              
              <label>
                <BsPaypal onClick={sendMsgForP2pAv} />
              </label>
            </div>
          </div> */}
          <div className="button-container">
            <div className="emoji">
              {/* <BsFillPlusCircleFill /> */}
              {/* <input accept="image/*" id="icon-button-file-p2p"
            type="file"  style={{ display: 'none' }}  onChange={p2pSendFile}/> */}
              {/* <button onClick={setModalIsOpenToTrue} style={{ background: "#080420"}} > <BsFillPenFill/> </button> */}
              <label>
                {/* <BsCollectionFill onClick={ipfsAllFileShow} /> */}
                <img src={send_receive} onClick={ipfsAllFileShow} />
                <span className="emojiText">Show All Files On IPFS</span>
              </label>
            </div>
          </div>
          <div className="button-container">
            <div className="emoji">
              {/* <BsFillPlusCircleFill /> */}
              {/* <input accept="image/*" id="icon-button-file"
            type="file"  style={{ display: 'none' }} onClick={setModalIsOpenToTrue}/> */}
              <button
                onClick={setModalIsOpenToTrue}
                style={{ background: "#080420", border: "transparent" }}
              >
                {" "}
                {/* <BsFillPenFill /> */}
                <img src={edit} />
                <span className="emojiText">Send File For Signature</span>
                {" "}
              </button>
              {/* <label htmlFor="icon-button-file">
            <BsFillPlusCircleFill/>
          </label> */}
            </div>
          </div>
          <form
            className="input-container"
            onSubmit={(event) => sendChat(event)}
          >
            <input
              type="text"
              placeholder="type your message here"
              onChange={(e) => setMsg(e.target.value)}
              value={msg}
            />
            <button type="submit">
              <IoMdSend />
            </button>
          </form>
          {/* <div className="sendManey-container" onClick={sendMoney}>
            <div className="sendManeyNdm">
              <Button><span>Send Maney</span><img src={money} /></Button>
            </div>
          </div> */}
          <Modal isOpen={modalIsOpen}>
            <button onClick={setModalIsOpenToFalse}>Back To Chat</button>
            <AnimeList />
          </Modal>
          <Modal isOpen={allIpfsFile} style={customStyles}>
            <h4
              onClick={ipfsAllFilsModelOff}
              style={{
                background: "transparent",
                color: "white",
                margin: "10px 0",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                borderRadius: "0.4rem",
                fontSize: "1rem",
                textTransform: "uppercase",
                marginBottom: "20px",
                display: "inline-block",
                textAlign: "right",
                width: "100%",
              }}
            >
              <span style={{ width: "25px", height: "25px", display: "block", borderRadius: "50%", border: "2px solid #fff", fontSize: "13px", padding: "6px", color: "#fff", float: "right" }}>X</span>
            </h4>
            <p style={{ paddingTop: "10px", paddingBottom: "10px", fontSize: "18px" }}>
              Sended Files
            </p>
            {allsendIPFSLink.length == 0 ? (
              <div style={{ paddingTop: "10px" }}>
                <p>Please Wait..</p>
              </div>
            ) : (
              <div className="modelMainDiv">
                {allsendIPFSLink.map((message, indexKey) => {
                  return (
                    <div key={uuidv4()} ref={scrollRef} className="testing">
                      <div
                        className={`message ${message.fromSelf ? "sendedIpfs" : "recievedIpfs"
                          }`}
                      >
                        {/* <p>{new Date(docSnap.requestedTime.seconds*1000).toDateString()+"   "+ new Date(docSnap.requestedTime.seconds*1000).getHours()%12+":"+new Date(docSnap.requestedTime.seconds*1000).getMinutes()}</p> */}
                        {message.message != "Send Files Not Found" ? (
                          <div className="middelDivForLink">
                            <table>
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Link</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="chat_date chat_input">{message.createdAt}</td>
                                  <td className="chat_link chat_input">
                                    {/* <a
                                      href={message.message}
                                      target="_blank"
                                    > */}
                                      {message.message}
                                    {/* </a> */}
                                  </td>
                                  <td className="chat_input">                                    
                                      {isShowLoader === indexKey ? (
                                        <img width="35px" src={LoadingGIF} />
                                      ) : (
                                        <BsFillCloudDownloadFill
                                          onClick={() =>
                                            downloadIpfsFile(message, indexKey)
                                          }
                                          style={{
                                            color: "#ffff00c8",
                                            cursor: "pointer",
                                            marginTop: 16,
                                            fontSize: 30,
                                            marginLeft: 30,
                                          }}
                                        />
                                      )}                                    
                                  </td>
                                </tr>
                              </tbody>
                            </table>



                          </div>
                        ) : (
                          <p>{message.message}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p style={{ paddingTop: "10px", paddingBottom: "10px", fontSize: "18px" }}>
              Received Files
            </p>
            {allreceiveIPFSLink.length == 0 ? (
              <div style={{ paddingTop: "10px" }}>
                <p>Please Wait..</p>
              </div>
            ) : (
              <div className="modelMainDiv">
                {allreceiveIPFSLink.map((message, indexKeyRec) => {
                  return (
                    <div key={uuidv4()} ref={scrollRef} className="testing">
                      <div
                        className={`message ${message.fromSelf ? "sendedIpfs" : "recievedIpfs"
                          }`}
                      >
                        {/* <p>{new Date(docSnap.requestedTime.seconds*1000).toDateString()+"   "+ new Date(docSnap.requestedTime.seconds*1000).getHours()%12+":"+new Date(docSnap.requestedTime.seconds*1000).getMinutes()}</p> */}
                        {message.message != "Receive Files Not Found" ? (
                          <div className="middelDivForLink">
                            <table>
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Link</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="chat_date chat_input">{message.createdAt}</td>
                                  <td className="chat_link chat_input">
                                    {/* <a 
                                      href={message.message}
                                      target="_blank"
                                    > */}
                                    {message.message}
                                    {/* </a> */}
                                  </td>
                                  <td className="chat_input">
                                    {isShowLoaderR === indexKeyRec ? (
                                      <img width="35px" src={LoadingGIF} />
                                    ) : (
                                      <BsFillCloudDownloadFill
                                        onClick={() =>
                                          downloadIpfsFile(message, indexKeyRec)
                                        }
                                        style={{
                                          color: "#ffff00c8",
                                          cursor: "pointer",
                                          marginTop: 16,
                                          fontSize: 30,
                                          marginLeft: 30,
                                        }}
                                      />
                                    )}

                                  </td>
                                </tr>
                              </tbody>
                            </table>



                          </div>
                        ) : (
                          <p>{message.message}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Modal>
          <Modal ariaHideApp={false} isOpen={fileSizeAndUpload} style={customStylesForIpfsUpload}>
            <h2>Your file is more than 20 MB so it will not be encrypted.  Shall we upload it directly to IPFS, are you ready for this ? </h2>
            <button onClick={yesFileUpload20Up} style={{
              backgroundColor: "green",
              border: "none",
              color: "white",
              height: "30%",
              width: "12%",
              borderRadius: "5px",
              marginTop: "10px",
              fontSize: "25px"
            }} className="yesClass" >Yes</button>
            <button onClick={noFileUpload20Up} style={{
              float: "right",
              backgroundColor: "red",
              border: "none",
              color: "white",
              height: "30%",
              width: "12%",
              borderRadius: "5px",
              marginTop: "10px",
              fontSize: "25px"
            }} className="noClass">No</button>
          </Modal>
        </Container>
      )}
      <ToastContainer />
    </>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  grid-template-columns: 5% 95%;
  background-color: #080420;
  padding: 0 3rem;
  justify-content: space-between;
  @media screen and (min-width: 345px) and (max-width: 1080px) {
    padding: 0 0.5rem;
    
  }
  @media screen and (min-width: 720px) and (max-width: 1080px) {    
    gap: 1rem;
  }
  .button-container {
    display: flex;
    align-items: center;
    color: white;
    gap: 1rem;
    .emoji {
      position: relative;
      padding:0 2px;
      img{
        @media only screen and (max-width: 767px) {
          max-width:20px;
          height:auto;
        }
      }
      svg {
        font-size: 1.5rem;
        color: #ffff00c8;
        cursor: pointer;
      }
      .emoji-picker-react {
        position: absolute;
        top: -210px;
        height: 190px;
        background-color: #080420;
        box-shadow: 0 5px 10px #9a86f3;
        border-color: #9a86f3;
        z-index: 10;
        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: #080420;
          width: 5px;
          &-thumb {
            background-color: #9a86f3;
          }
        }
        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }
        .emoji-search {
          background-color: transparent;
          border-color: #9a86f3;
        }
        .emoji-group:before {
          background-color: #080420;
        }
      }
    }
  }
  .input-container {
    width: 80%;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    background-color: #ffffff34;
    input {
      width: 90%;
      height: 60%;
      background-color: transparent;
      color: white;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;

      &::selection {
        background-color: #9a86f3;
      }
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 0.3rem 2rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #9a86f3;
      border: none;
      @media screen and (min-width: 345px) and (max-width: 1080px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
        }
      }
      svg {
        font-size: 2rem;
        color: white;
        margin-right:-5px;
      }
    }
  }
  .sendManey-container {
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: #9a86f3;
    cursor: pointer;
    button {
      background-color: #9a86f3;
      border: none;
      color:#fff;
      span{
        @media screen and (max-width:767px){
          display:none;
        }
      }
      img{
        display:none;
        @media screen and (max-width:767px){
          display:block;
        }
      }
      
    }
  }
`;
