// import { initializeApp } from 'firebase/app';
import firebase from 'firebase/compat/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

var firebaseConfig = {
    apiKey: "AIzaSyCEzcj8VulgbVcsxNahCWoZsF9z3X1t9zY",
    authDomain: "messagingapp-3b949.firebaseapp.com",
    projectId: "messagingapp-3b949",
    storageBucket: "messagingapp-3b949.appspot.com",
    messagingSenderId: "117411187628",
    appId: "1:117411187628:web:70ea36873586a8175f4809",
    measurementId: "G-TQ6ECD5GEG"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  else{
    firebase.app()
  }

// initializeApp(firebaseConfig);

const messaging = getMessaging();
export const requestForToken = () => {
    return getToken(messaging)
        .then((currentToken) => {
            if (currentToken) {
                // Perform any other neccessary action with the token
                localStorage.setItem('device_token', currentToken);
                console.log('No registration token available. Request permission to generate one.');
            } else {
                // Show permission request UI
                // alert('No registration token available. Request permission to generate one.')
            }
        })
        .catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
        });
};

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker `messaging.onBackgroundMessage` handler.
export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });
