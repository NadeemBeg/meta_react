import React, { useEffect, useState } from "react";
import { Button, Table, Text, Spinner } from "gestalt";
import "gestalt/dist/gestalt.css";
import { useDispatch } from "react-redux";
import { searchForDocumentsSigned } from "../../firebase/firebase";
import { setDocToView } from "../ViewDocument/ViewDocumentSlice";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import axios from "axios";
import { sendOtp, verifyOTP } from "../../utils/APIRoutes";
import './sign_list.css';
import { ToastContainer, toast } from "react-toastify";

const SignedList = () => {
  const { email } = JSON.parse(localStorage.getItem('chat-app-current-user'));
  const [docs, setDocs] = useState([]);
  const [show, setShow] = useState(true);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    async function getDocs() {
      const docsToView = await searchForDocumentsSigned(email);
      docsToView.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (b.signedTime) - (a.signedTime);
      });
      setDocs(docsToView);
      setShow(false);
    }
    setTimeout(getDocs, 1000);
  }, [email]);

  const verifyOtp = async (event) => {
    event.preventDefault();
    var email = JSON.parse(localStorage.getItem("chat-app-current-user")).email;
    const formdata = new FormData();
    formdata.append("email", email);
    formdata.append("otp", msg);
    const otpVerifyApi = await axios.post(verifyOTP, formdata, {
      headers: {
        "Content-Type": "application/json",
        Accept: "*",
      },
    });
    if (otpVerifyApi.data.success) {
      navigate("/viewDocument");
      // setModalIsOpen(true);
    }
    else{
      console.log("otpVerifyApi",otpVerifyApi);
      if(otpVerifyApi.data.message == "OTP mismatch."){
        toast.error("OTP Is Mismatch", toastOptions);
        return false;
      }
    }

  };

  const sendOtpAfterView = async () => {
    var email = JSON.parse(localStorage.getItem("chat-app-current-user")).email;
    const formdata = new FormData();
    formdata.append("email", email);
    const sendOTP = await axios.post(sendOtp, formdata, {
      headers: {
        "Content-Type": "application/json",
        Accept: "*",
      },
    });
    if (sendOTP.data.success) {
      setModalIsOpen(true);
    }
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
  const certificate = async () => {
    window.open('/my-document', '_blank', 'noreferrer');
    // navigate('/my-document');
  }

  const setDocsData = (doc) => {
    const { docRef, docId } = doc;
    localStorage.setItem('docs', JSON.stringify({ docRef, docId, email: doc.emails[0] }));
    dispatch(setDocToView({ docRef, docId }));
  }

  return (
    <div>
      {show ? (
        <Spinner show={show} accessibilityLabel="spinner" />
      ) : (
        <div>
          {docs.length > 0 ? (
            <table className="view_table">
              <thead>
                <tr>
                  <th>                  
                      From                    
                  </th>
                  <th>
                    
                      When
                    
                  </th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.docRef}>
                    <td className="email">
                    {doc.emails.map((email) => (
                        <Text color="white" key={email}>
                          {email}
                        </Text>
                      ))}
                    </td>
                    <td className="time">                      
                        {doc.signedTime
                          ? new Date(
                            doc.signedTime.seconds * 1000
                          ).toDateString() +
                          "  " +
                          (new Date(
                            doc.signedTime.seconds * 1000
                          ).getHours() %
                            12) +
                          ":" +
                          new Date(doc.signedTime.seconds * 1000).getMinutes()
                          : ""}                      
                    </td>
                    <td className="btn">
                      <button className="doc-btn"
                        onClick={(event) => {
                          setDocsData(doc);
                          sendOtpAfterView();
                        }}                        
                      >View</button>
                      <button className="doc-btn"
                        onClick={(event) => {
                          setDocsData(doc);
                          certificate()
                        }}                        
                      >Certificate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            "You do not have any documents to review"
          )}
        </div>
      )}
      <Modal isOpen={modalIsOpen} style={customStyles} onHide={setModalIsOpenToFalse}>
        <button style={{ float: "right", border: "0.1rem solid #4e0eff", borderRadius: "0.4rem", fontSize: "1rem", padding: "0.5rem", }} onClick={setModalIsOpenToFalse}>
          <span style={{ width: "25px", height: "25px", display: "block", borderRadius: "50%", border: "1px solid #0d0d30", fontSize: "13px", padding: "6px", color: "#0d0d30" }}>X</span>
        </button>

        <form
          className="input-container"
          onSubmit={(event) => verifyOtp(event)}
        >
          <input className="otp"
            type="number"
            placeholder="type your otp"
            onChange={(e) => setMsg(e.target.value)}
            value={msg}
          />
          <button className="otp_submit" type="submit">Submit</button>
        </form>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default SignedList;
