import React, { useRef, useEffect, useState } from "react";
import { storage, updateDocumentToSign } from "../../firebase/firebase";
import WebViewer from "@pdftron/webviewer";
import "gestalt/dist/gestalt.css";
import "./SignDocument.css";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import {
  sendMessageRoute,
  host,
  updateUser
} from "../../utils/APIRoutes";
import back from "../../assets/back.svg";

const SignDocument = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const socket = useRef();
  const [currentChat, setCurrentChat] = useState(undefined);
  const [annotationManager, setAnnotationManager] = useState(null);
  const [annotPosition, setAnnotPosition] = useState(0);
  const [changeItem, setChangedItem] = useState(null);
  const navigate = useNavigate();
  const { docRef, docId } = JSON.parse(localStorage.getItem('SIGN_DOC'));
  const { email } = JSON.parse(localStorage.getItem('FB_USER'));;
  const viewer = useRef(null);
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(async () => {
    setCurrentUser(
      await JSON.parse(
        localStorage.getItem('chat-app-current-user')
      )
    );
  }, []);
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
    var currentChat = JSON.parse(localStorage.getItem("current-chat-with"));
    setCurrentChat(currentChat);
  }, [currentUser]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem('chat-app-current-user')
    );
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg: msg.msg,
    });
    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      device_token: currentChat?.device_token,
      message: msg.msg,
      docUrl: msg.docUrl
    });

    const currentUser = JSON.parse(localStorage.getItem('chat-app-current-user'));
    const response = await axios.post(updateUser, {
      id: currentUser._id,
      newMsgUserId: currentChat._id
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg.msg });
    setMessages(msgs);
  };

  useEffect(() => {
    WebViewer(
      {
        path: "webviewer",
        disabledElements: [
          "ribbons",
          "toggleNotesButton",
          "searchButton",
          "menuButton",
          "rubberStampToolGroupButton",
          "stampToolGroupButton",
          "fileAttachmentToolGroupButton",
          "calloutToolGroupButton",
          "undo",
          "redo",
          "eraserToolButton",
        ],
      },
      viewer.current
    ).then(async (instance) => {
      const { documentViewer, annotationManager, Annotations } = instance.Core;
      setAnnotationManager(annotationManager);

      // select only the insert group
      instance.UI.setToolbarGroup("toolbarGroup-Insert");

      // load document
      const storageRef = storage.ref();
      const URL = await storageRef.child(docRef).getDownloadURL();
      documentViewer.loadDocument(URL);

      const normalStyles = (widget) => {
        if (widget instanceof Annotations.TextWidgetAnnotation) {
          return {
            "background-color": "#a5c7ff",
            color: "white",
          };
        } else if (widget instanceof Annotations.SignatureWidgetAnnotation) {
          return {
            border: "1px solid #a5c7ff",
          };
        }
      };

      annotationManager.on(
        "annotationChanged",
        (annotations, action, { imported }) => {
          if (imported && action === "add") {
            annotations.forEach(async function (annot) {
              if (annot instanceof Annotations.WidgetAnnotation) {
                Annotations.WidgetAnnotation.getCustomStyles = normalStyles;
                if (!annot.fieldName.startsWith(email)) {
                  annot.Hidden = true;
                  annot.Listable = false;
                }
              }
            });
          }
        }
      );

      const xfdf = await annotationManager.exportAnnotations({
        widgets: false,
        links: false,
      });
      setChangedItem(xfdf);
    });
  }, [docRef, email]);

  const nextField = () => {
    let annots = annotationManager.getAnnotationsList();
    if (annots[annotPosition]) {
      annotationManager.jumpToAnnotation(annots[annotPosition]);
      if (annots[annotPosition + 1]) {
        setAnnotPosition(annotPosition + 1);
      }
    }
  };

  const prevField = () => {
    let annots = annotationManager.getAnnotationsList();
    if (annots[annotPosition]) {
      annotationManager.jumpToAnnotation(annots[annotPosition]);
      if (annots[annotPosition - 1]) {
        setAnnotPosition(annotPosition - 1);
      }
    }
  };

  const completeSigning = async () => {
    const xfdf = await annotationManager.exportAnnotations({
      widgets: false,
      links: false,
    });
    if (changeItem === xfdf) {
      toast.error("Please add sign", toastOptions);
      return;
    }
    await updateDocumentToSign(docId, email, xfdf)
    const storageRef = storage.ref();
    let getURL = await storageRef.child(docRef).getDownloadURL();
    await handleSendMsg({ msg: "Document Successfully Signed.", docUrl: getURL });
    navigate("/");
  };

  const signDocument = {
    color: "#fff",
    fontSize: "24px",
    padding: "20px",
    fontWeight: "bold",
  };

  return (
    <div
      className={"prepareDocument"}
      style={{
        height: "100vh",
        overflow: "auto",
        backgroundColor: " #6d4cd4",
        color: "white",
      }}
    >

      <div className="back-btn">
        <a href="" className={"back docs-btn"} onClick={() => { navigate(`/`) }}> 
          <img src={back} /><span>Back</span>
        </a>
      </div>
      <span style={signDocument}>Sign Document</span>
      <div className={'btn-ls'}>
        <button className={'btn-nm'} onClick={nextField}>
          Next Field
        </button>
        <button className={'btn-nm'} onClick={prevField}>
          Previous Field
        </button>
        <button className={'btn-nm'} onClick={completeSigning}>
          Complete Signing
        </button>
      </div>
      <div className="webviewer" ref={viewer}></div>
      <ToastContainer />
    </div>
  );
};

export default SignDocument;
