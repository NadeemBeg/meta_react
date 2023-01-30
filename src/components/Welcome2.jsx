import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import SignList from "./Lists/SignList";
import SignedList from "./Lists/SignedList";
import { resetDocToView } from "./ViewDocument/ViewDocumentSlice";
import { resetDocToSign } from "./SignDocument/SignDocumentSlice";
import "gestalt/dist/gestalt.css";
import { useNavigate } from "react-router-dom";
import './Welcome2.css';
import back from "../assets/back.svg";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(resetDocToView());
    dispatch(resetDocToSign());
  }, [dispatch]);

  return (
    <div className={"main-docs"}>
      <div className="back-btn">
        <a href="" className={"back welcome docs-btn"} onClick={() => { navigate(`/`) }}> 
          <img src={back} /><span>Back</span>
        </a>
      </div>
      <div className="main_page">
        <div className={"docs"}>
          <label className={"docs-label"}>Prepare Document</label>
          <button className={"docs-btn"}
            onClick={() => { navigate(`/prepareDocument`) }}
          >Prepare Document For Signing</button>
        </div>

        <div className={"docs"}>
          <label className={"docs-label"}>Sign Documents</label>
          <SignList />
        </div>

        <div className={"docs"}>
          <label className={"docs-label"}>Review Signed Documents</label>
          <SignedList />
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
