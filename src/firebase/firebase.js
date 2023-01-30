import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import axios from 'axios'
import { getStorage, ref, listAll } from "firebase/storage";
import { useNavigate } from "react-router-dom";


// import { mergeAnnotations } from '../components/MergeAnnotations/MergeAnnotations';
import { mergeAnnotations } from '../components/MergeAnnotations/MergeAnnotations';


const firebaseConfig = {
  apiKey: 'AIzaSyCEzcj8VulgbVcsxNahCWoZsF9z3X1t9zY',
  authDomain: 'messagingapp-3b949.firebaseapp.com',
  databaseURL: 'messagingapp-3b949.asia-southeast1.firebasedatabase.app',
  projectId: 'messagingapp-3b949',
  storageBucket: 'messagingapp-3b949.appspot.com',
  messagingSenderId: '117411187628',
  appId: '1:117411187628:web:70ea36873586a8175f4809',
  measurementId: "G-TQ6ECD5GEG"
};
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
else {
  firebase.app(firebaseConfig)
}

firebase.firestore().enableNetwork();
const app = firebase.initializeApp(firebaseConfig);

const storageFirebase = getStorage(app);



export { storageFirebase, app };

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

const provider = new firebase.auth.GoogleAuthProvider();
export const signInWithGoogle = () => {
  auth.signInWithPopup(provider);
};

export const generateUserDocument = async (user, additionalData) => {

  if (!user) return;
  const userRef = firestore.doc(`users/${user.uid}`);
  const snapshot = await userRef.get();
  if (!snapshot.exists) {
    const { email, displayName, photoURL } = user;
    try {
      await userRef.set({
        displayName,
        email,
        photoURL,
        ...additionalData,
      });
    } catch (error) {
      console.error('Error creating user document', error);
    }
  }
  return getUserDocument(user.uid);
};

const getUserDocument = async uid => {
  if (!uid) return null;
  try {
    const userDocument = await firestore.doc(`users/${uid}`).get();
    return {
      uid,
      ...userDocument.data(),
    };
  } catch (error) {
    console.error('Error fetching user', error);
  }
};

export const addDocumentToSign = async (uid, email, docRef, emails) => {
  if (!uid) return;
  const signed = false;
  const xfdf = [];
  const signedBy = [];
  const requestedTime = new Date();
  const requestedIpAddress = localStorage.getItem('ip');
  const signedTime = '';
  const signedIpAddress = '';
  firestore
    .collection('documentsToSign')
    .add({
      uid,
      email,
      docRef,
      emails,
      xfdf,
      signedBy,
      signed,
      requestedTime,
      signedTime,
      requestedIpAddress,
      signedIpAddress
    })
    .then(function (docRef) {
    })
    .catch(function (error) {
      console.error('Error adding document: ', error);
    });
};

export const updateDocumentToSign = async (docId, email, xfdfSigned) => {
  const documentRef = firestore.collection('documentsToSign').doc(docId);
  const signedIpAddress = localStorage.getItem('ip');
  let getURL;
  documentRef
    .get()
    .then(async doc => {
      if (doc.exists) {
        const { signedBy, emails, xfdf, docRef } = doc.data();
        if (!signedBy.includes(email)) {
          const signedByArray = [...signedBy, email];
          const xfdfArray = [...xfdf, xfdfSigned];
          await documentRef.update({
            xfdf: xfdfArray,
            signedBy: signedByArray,
          });

          if (signedByArray.length === emails.length) {
            const time = new Date();
            await documentRef.update({
              signed: true,
              signedTime: time,
              signedIpAddress: signedIpAddress
            });
            mergeAnnotations(docRef, xfdfArray);
          }
        }
        
        // console.log("getURLgetURLgetURLgetURL",getURL);
        // return getURL;
      } else {
        console.log('No such document!');
      }
      console.log("returnreturnreturn",getURL)
      
    })
    .catch(function (error) {
      console.log('Error getting document:', error);
    });
};

export const searchForDocumentToSign = async email => {
  const documentsRef = firestore.collection('documentsToSign');
  const query = documentsRef
    .where('emails', 'array-contains', email)
    .where('signed', '==', false);

  const querySigned = documentsRef
    .where('signedBy', 'array-contains', email);

  const docIds = [];
  const docIdSigned = [];

  await querySigned
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const docId = doc.id;
        docIdSigned.push(docId);
      });
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error);
    });

  await query
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const { docRef, email, requestedTime } = doc.data();
        const docId = doc.id;
        if (!docIdSigned.includes(docId)) {
          docIds.push({ docRef, email, requestedTime, docId });
        }
      });
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error);
    });
  return docIds;
};

export const searchForDocumentsSigned = async email => {
  const documentsRef = firestore.collection('documentsToSign');

  const docIds = [];

  let query = documentsRef
    .where('email', '==', email)
    .where('signed', '==', true);

  await query
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const { docRef, emails, signedTime } = doc.data();
        const docId = doc.id;
        docIds.push({ docRef, emails, signedTime, docId });
      });
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error);
    });

  return docIds;
};


export const getOneDoc = async docId => {
  const documentRef = firestore.collection('documentsToSign').doc(docId);
  var onedoc;
  await documentRef
    .get()
    .then(async doc => {
      if (doc.exists) {
        onedoc = doc.data()
      }
    })
    .catch(function (error) {
      console.log('Error getting document:', error);
    });
  return onedoc;
};

const storageFiles = getStorage();
const listRef = ref(storageFiles, 'files/');
listAll(listRef)
  .then((res) => {
  }).catch((error) => {
    console.log("error",error);
  });
