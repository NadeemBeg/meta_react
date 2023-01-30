import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, addDocumentToSign } from "../../firebase/firebase";
import WebViewer from "@pdftron/webviewer";
import "gestalt/dist/gestalt.css";
import "./PrepareDocument.css";
import axios from "axios";
import {
  sendMessageRoute,
  host,
  updateUser,
} from "../../utils/APIRoutes";
import { io } from "socket.io-client";
import back from "../../assets/back.svg";
import { ToastContainer, toast } from "react-toastify";
import LoadingGIF from '../../assets/download-gif.gif';
const PrepareDocument = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const socket = useRef();
  const [currentChat, setCurrentChat] = useState(undefined);

  const [instance, setInstance] = useState(null);
  const [dropPoint, setDropPoint] = useState(null);
  const [loader, setloader] = useState(false);
  const navigate = useNavigate();

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
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      msg,
    });
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      device_token: currentChat?.device_token,
      message: msg,
    });

    await axios.post(updateUser, {
      id: currentUser._id,
      newMsgUserId: currentChat._id
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  const { uid, email } = JSON.parse(localStorage.getItem('FB_USER'));

  const viewer = useRef(null);
  const filePicker = useRef(null);

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    WebViewer(
      {
        path: "webviewer",
        disabledElements: [
          "ribbons",
          "toggleNotesButton",
          "searchButton",
          "menuButton",
        ],
      },
      viewer.current
    ).then((instance) => {
      const { iframeWindow } = instance;

      // select only the view group
      instance.UI.setToolbarGroup("toolbarGroup-View");

      setInstance(instance);

      const iframeDoc = iframeWindow.document.body;
      iframeDoc.addEventListener("dragover", dragOver);
      iframeDoc.addEventListener("drop", (e) => {
        drop(e, instance);
      });

      filePicker.current.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          instance.UI.loadDocument(file);
        }
      };
    });
  }, []);
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const applyFields = async () => {
    const { Annotations, documentViewer } = instance.Core;
    const annotationManager = documentViewer.getAnnotationManager();
    const fieldManager = annotationManager.getFieldManager();
    const annotationsList = annotationManager.getAnnotationsList();
    const annotsToDelete = [];
    const annotsToDraw = [];
    // console.log("fieldManager",fieldManager,"annotationsList",annotationsList,"filePicker",filePicker);
    // if(!filePicker.current.value){
    //   toast.error("Please Upload Doc", toastOptions);
    //   return;
    // }
    // if(annotationsList.length < 1){
    //   toast.error("Please add sign, text or date", toastOptions);
    //   return;
    // }
    setloader(true)
    await Promise.all(
      annotationsList.map(async (annot, index) => {
        let inputAnnot;
        let field;
        console.log("annot",annot);
        if (typeof annot.custom !== "undefined") {
          // create a form field based on the type of annotation
          if (annot.custom.type === "TEXT") {
            field = new Annotations.Forms.Field(
              annot.getContents() + Date.now() + index,
              {
                type: "Tx",
                value: annot.custom.value,
              }
            );
            inputAnnot = new Annotations.TextWidgetAnnotation(field);
          } else if (annot.custom.type === "SIGNATURE") {
            field = new Annotations.Forms.Field(
              annot.getContents() + Date.now() + index,
              {
                type: "Sig",
              }
            );
            inputAnnot = new Annotations.SignatureWidgetAnnotation(field, {
              appearance: "_DEFAULT",
              appearances: {
                _DEFAULT: {
                  Normal: {
                    data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuMWMqnEsAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC",
                    offset: {
                      x: 100,
                      y: 100,
                    },
                  },
                },
              },
            });
          } else if (annot.custom.type === "DATE") {
            field = new Annotations.Forms.Field(
              annot.getContents() + Date.now() + index,
              {
                type: "Tx",
                value: "m-d-yyyy",
                // Actions need to be added for DatePickerWidgetAnnotation to recognize this field.
                actions: {
                  F: [
                    {
                      name: "JavaScript",
                      // You can customize the date format here between the two double-quotation marks
                      // or leave this blank to use the default format
                      javascript: 'AFDate_FormatEx("mmm d, yyyy");',
                    },
                  ],
                  K: [
                    {
                      name: "JavaScript",
                      // You can customize the date format here between the two double-quotation marks
                      // or leave this blank to use the default format
                      javascript: 'AFDate_FormatEx("mmm d, yyyy");',
                    },
                  ],
                },
              }
            );
              console.log("field",field);
            inputAnnot = new Annotations.DatePickerWidgetAnnotation(field);
          } else {
            // exit early for other annotations
            alert("not select any thing")
            console.log("testasdfasdfasdfasdfasd");

            // annotationManager.deleteAnnotation(annot, false, true); // prevent duplicates when importing xfdf
            return;
          }
        } else {
          // exit early for other annotations
          console.log("testasdfasdfasdfasdfasd");
          return;
        }

        // set position
        inputAnnot.PageNumber = annot.getPageNumber();
        inputAnnot.X = annot.getX();
        inputAnnot.Y = annot.getY();
        inputAnnot.rotation = annot.Rotation;
        if (annot.Rotation === 0 || annot.Rotation === 180) {
          inputAnnot.Width = annot.getWidth();
          inputAnnot.Height = annot.getHeight();
        } else {
          inputAnnot.Width = annot.getHeight();
          inputAnnot.Height = annot.getWidth();
        }

        // delete original annotation
        annotsToDelete.push(annot);

        // customize styles of the form field
        Annotations.WidgetAnnotation.getCustomStyles = function (widget) {
          if (widget instanceof Annotations.SignatureWidgetAnnotation) {
            return {
              border: "1px solid #a5c7ff",
            };
          }
        };
        Annotations.WidgetAnnotation.getCustomStyles(inputAnnot);

        // draw the annotation the viewer
        annotationManager.addAnnotation(inputAnnot);
        fieldManager.addField(field);
        annotsToDraw.push(inputAnnot);
      })
    );

    // delete old annotations
    annotationManager.deleteAnnotations(annotsToDelete, null, true);

    // refresh viewer
    await annotationManager.drawAnnotationsFromList(annotsToDraw);
    await uploadForSigning();
    setloader(false)
    navigate("/");
  };

  const addField = (type, point = {}, name = "", value = "", flag = {}) => {
    const { documentViewer, Annotations } = instance.Core;
    const annotationManager = documentViewer.getAnnotationManager();
    const doc = documentViewer.getDocument();
    const displayMode = documentViewer.getDisplayModeManager().getDisplayMode();
    const page = displayMode.getSelectedPages(point, point);
    if (!!point.x && page.first == null) {
      return; //don't add field to an invalid page location
    }
    const page_idx =
      page.first !== null ? page.first : documentViewer.getCurrentPage();
    const page_info = doc.getPageInfo(page_idx);
    const page_point = displayMode.windowToPage(point, page_idx);
    const zoom = documentViewer.getZoom();

    var textAnnot = new Annotations.FreeTextAnnotation();
    textAnnot.PageNumber = page_idx;
    const rotation = documentViewer.getCompleteRotation(page_idx) * 90;
    textAnnot.Rotation = rotation;
    if (rotation === 270 || rotation === 90) {
      textAnnot.Width = 50.0 / zoom;
      textAnnot.Height = 250.0 / zoom;
    } else {
      textAnnot.Width = 250.0 / zoom;
      textAnnot.Height = 50.0 / zoom;
    }
    textAnnot.X = (page_point.x || page_info.width / 2) - textAnnot.Width / 2;
    textAnnot.Y = (page_point.y || page_info.height / 2) - textAnnot.Height / 2;

    textAnnot.setPadding(new Annotations.Rect(0, 0, 0, 0));
    textAnnot.custom = {
      type,
      value,
      flag,
      name: `${currentChat.email}_${type}_`,
    };

    // set the type of annot
    textAnnot.setContents(textAnnot.custom.name);
    textAnnot.FontSize = "" + 20.0 / zoom + "px";
    textAnnot.FillColor = new Annotations.Color(211, 211, 211, 0.5);
    textAnnot.TextColor = new Annotations.Color(0, 165, 228);
    textAnnot.StrokeThickness = 1;
    textAnnot.StrokeColor = new Annotations.Color(0, 165, 228);
    textAnnot.TextAlign = "center";

    textAnnot.Author = annotationManager.getCurrentUser();

    annotationManager.deselectAllAnnotations();
    annotationManager.addAnnotation(textAnnot, true);
    annotationManager.redrawAnnotation(textAnnot);
    annotationManager.selectAnnotation(textAnnot);
  };

  const uploadForSigning = async () => {
    // upload the PDF with fields as AcroForm
    const storageRef = storage.ref();
    const referenceString = `docToSign/${uid}${Date.now()}.pdf`;
    const docRef = storageRef.child(referenceString);
    const { docViewer, annotManager } = instance;
    const doc = docViewer.getDocument();
    const xfdfString = await annotManager.exportAnnotations({
      widgets: true,
      fields: true,
    });
    const data = await doc.getFileData({ xfdfString });
    const arr = new Uint8Array(data);
    const blob = new Blob([arr], { type: "application/pdf" });
    docRef.put(blob).then(function (snapshot) { });

    // create an entry in the database
    // const emails = assignees.map((assignee) => {
    //   return assignee.email;
    // });
    const emails = currentChat.email;
    await addDocumentToSign(uid, email, referenceString, [emails]);
    await handleSendMsg("send document for sign");
    // const response = await axios.post(updateUser, {
    //   id:currentUser._id,
    //   newMsgUserId:currentChat._id
    // });
   
  };

  const dragOver = (e) => {
    e.preventDefault();
    return false;
  };

  const drop = (e, instance) => {
    const { docViewer } = instance;
    const scrollElement = docViewer.getScrollViewElement();
    const scrollLeft = scrollElement.scrollLeft || 0;
    const scrollTop = scrollElement.scrollTop || 0;
    setDropPoint({ x: e.pageX + scrollLeft, y: e.pageY + scrollTop });
    e.preventDefault();
    return false;
  };

  const dragStart = (e) => {
    e.target.style.opacity = 0.5;
    const copy = e.target.cloneNode(true);
    copy.id = "form-build-drag-image-copy";
    copy.style.width = "250px";
    document.body.appendChild(copy);
    e.dataTransfer.setDragImage(copy, 125, 25);
    e.dataTransfer.setData("text", "");
  };

  const dragEnd = (e, type) => {
    addField(type, dropPoint);
    e.target.style.opacity = 1;
    document.body.removeChild(
      document.getElementById("form-build-drag-image-copy")
    );
    e.preventDefault();
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
      
      <label className={"docs-text"}>Prepare Docs</label>
      { loader ? <img className="down-loader" style={{"display":"block","marginLeft":"auto","marginRight":"auto"}} src={LoadingGIF} /> :
      <div className={'btn-doc-action'}>
        <div>
          <label className="label_step">Step 1</label>
          <button className={'btn-docs'}
            onClick={() => {
              if (filePicker) {
                filePicker.current.click();
              }
            }}>
            Upload Docs
          </button>
        </div>
        <div>
          <label className="label_step">Step 2</label>
          <div className={'btn-list'}>
            <div
              draggable
              onDragStart={(e) => dragStart(e)}
              onDragEnd={(e) => dragEnd(e, "SIGNATURE")}
            >
              <button className={'btn-docs'}
                onClick={() => addField("SIGNATURE")}>Add Signature</button>
            </div>
            <div
              draggable
              onDragStart={(e) => dragStart(e)}
              onDragEnd={(e) => dragEnd(e, "TEXT")}
            >
              <button className={'btn-docs'}
                onClick={() => addField("TEXT")}>Add Text</button>
            </div>
            <div
              draggable
              onDragStart={(e) => dragStart(e)}
              onDragEnd={(e) => dragEnd(e, "DATE")}
            >
              <button className={'btn-docs'}
                onClick={() => addField("DATE")}>Add Date</button>
            </div>
          </div>
        </div>
        <div>
          <label className="label_step">Step 3</label>
          <button className={'btn-docs'} onClick={applyFields}>Send</button>
        </div>
      </div>
      }
      <div className="webviewer" ref={viewer}></div>
      <input type="file" ref={filePicker} style={{ display: "none" }} />
      <ToastContainer />
    </div>
  );
};

export default PrepareDocument;
