import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer
} from "@react-pdf/renderer";
import axios from "axios";
import { getUserByEmail } from "../utils/APIRoutes";
import { getOneDoc } from '../firebase/firebase';
import LoadingGIF from '../assets/download-gif.gif';
// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    color: "black",
    padding: 20,
  },
  section: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#808080',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
  },
  viewer: {
    width: window.innerWidth, //the pdf viewer will take up all of the width and height
    height: window.innerHeight,
  },
  heading: {
    fontSize: 16,
    textAlign: 'center',
  },
  userDetails: {
    fontSize: 14,
    fontWeight: 1000,
    color: '#000080',
    marginTop: 20,
    marginBottom: 8,
  },
  address: {
    fontSize: 10,
  }
});

// Create Document Component 
export default function MyDocument() {
  const [loginUser, setLoginUser] = useState();
  const [chatUser, setChatUser] = useState();
  const [loginUseremail, setLoginUseremail] = useState();
  const [chatUseremail, setChatUseremail] = useState();
  const [loginUsername, setLoginUsername] = useState();
  const [chatUsername, setChatUsername] = useState();
  const [requestedTime, setRequestedTime] = useState();
  const [signedTime, setsignedTime] = useState();
  const [requestedIpAddress1, setRequestedIpAddress1] = useState('');
  const [signedIpAddress1, setSignedIpAddress1] = useState('');
  const [loader, setLoder]= useState(true);

  let docs = JSON.parse(localStorage.getItem('docs'));

  useEffect(async () => {
    const loginUser1 = JSON.parse(localStorage.getItem('chat-app-current-user'));
    setLoginUser(loginUser1.metamask);
    setLoginUseremail(loginUser1.email);
    setLoginUsername(loginUser1.username);

    const docSnap = await getOneDoc(docs.docId);
    const formdata = new FormData();
    formdata.append('email', docs.email);
    const data = await axios.post(getUserByEmail, formdata, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "*"
      }
    });
    var fromUser = data.data;
    setChatUser(fromUser.metamask);
    setChatUseremail(fromUser.email);
    setChatUsername(fromUser.username);

    setRequestedIpAddress1(docSnap.requestedIpAddress);
    setSignedIpAddress1(docSnap.signedIpAddress);
    setRequestedTime(new Date(docSnap.requestedTime.seconds * 1000).toDateString() + "   " + new Date(docSnap.requestedTime.seconds * 1000).getHours() % 12 + ":" + new Date(docSnap.requestedTime.seconds * 1000).getMinutes());
    setsignedTime(new Date(docSnap.signedTime.seconds * 1000).toDateString() + "  " + new Date(docSnap.signedTime.seconds * 1000).getHours() % 12 + ":" + new Date(docSnap.signedTime.seconds * 1000).getMinutes())
    setLoder(false)
  }, [])

  return (
    <div style={{"display":"flex","justifyContent":"center","alignItems":"center","height":"100vh"}}>
      { loader ? <img className="down-loader"  src={LoadingGIF} /> :
    <PDFViewer style={styles.viewer}>
      {/* Start of the document*/}
      <Document>
        {/*render a single page*/}
        <Page size="A4" style={styles.page}>
          <Text style={styles.heading}>Metamask Signature Certificate</Text>

          <Text style={styles.userDetails}>Sender</Text>

          <View style={styles.section}>
            <Text style={styles.address}>Metamask Address</Text>
            <Text style={styles.address}>{loginUser}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.address}>Email</Text>
            <Text style={styles.address}>{loginUseremail}</Text>
          </View>

          <Text style={styles.userDetails}>Receiver</Text>

          <View style={styles.section}>
            <Text style={styles.address}>Metamask Address</Text>
            <Text style={styles.address}>{chatUser}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.address}>Email</Text>
            <Text style={styles.address}>{chatUseremail}</Text>
          </View>

          <Text style={styles.userDetails}>Audit Trail</Text>

          <View style={styles.section}>
            <Text style={styles.address}>Date And Time</Text>
            <Text style={styles.address}>Recipient</Text>
            <Text style={styles.address}>Action</Text>
            <Text style={styles.address}>IP Address</Text>
            <Text style={styles.address}>Other</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.address}>{requestedTime}</Text>
            <Text style={styles.address}>{loginUsername}</Text>
            <Text style={styles.address}>Created</Text>
            <Text style={styles.address}>{requestedIpAddress1}</Text>
            <Text style={styles.address}>-</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.address}>{signedTime}</Text>
            <Text style={styles.address}>{chatUsername}</Text>
            <Text style={styles.address}>Signed</Text>
            <Text style={styles.address}>{signedIpAddress1}</Text>
            <Text style={styles.address}>-</Text>
          </View>


        </Page>
      </Document>
    </PDFViewer>
    }
    </div>
  );
}