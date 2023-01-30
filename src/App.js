import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

import SetAvatar from "./components/SetAvatar";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MetaMask from "./pages/Metamask";

import AssignUsers from './components/AssignUsers';
import Preparation from './components/Preparation';
import Sign from './components/Sign';
import View from './components/View';
import DocUpload from "./components/Welcome2";
import { auth, generateUserDocument } from './firebase/firebase';
import { setUser, selectUser } from './firebase/firebaseSlice';
import MyDocument from "./components/MyDocument";
import GenrateCertificate from "./components/CertificateForFile"
import { requestForToken } from './notification/firebase';
import axios from "axios";

export default function App() {
  useSelector(selectUser);
  const dispatch = useDispatch();
  requestForToken();
  useEffect(async () => {
    const res = await axios.get('https://geolocation-db.com/json/');
    localStorage.setItem('ip', res.data.IPv4);
    auth.onAuthStateChanged(async userAuth => {
      if (userAuth) {
        const user = await generateUserDocument(userAuth);
        const { uid, displayName, email, photoURL } = user;
        localStorage.setItem('FB_USER', JSON.stringify(user));
        dispatch(setUser({ uid, displayName, email, photoURL }));
      }
    });
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/my-document" element={<MyDocument />} />
        <Route path="/genrateCertificate" element={<GenrateCertificate />} />

        <Route path="/metamask" element={<MetaMask />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setAvatar" element={<SetAvatar />} />
        <Route path="/" element={<Chat />} />


        <Route path="/docUpload" element={<DocUpload />} />
        <Route path="/assignUsers" element={<AssignUsers />} />
        <Route path="/viewDocument" element={<View />} />
        <Route path="/prepareDocument" element={<Preparation />} />
        <Route path="/signDocument" element={<Sign />} />


      </Routes>
    </BrowserRouter>
  );
}
