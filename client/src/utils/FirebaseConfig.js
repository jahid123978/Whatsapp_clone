import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyBS3l2oltj6K3Ko6nkvArDCx0bJc9z9Lk8",
    authDomain: "chat-app-31512.firebaseapp.com",
    projectId: "chat-app-31512",
    storageBucket: "chat-app-31512.appspot.com",
    messagingSenderId: "509594182170",
    appId: "1:509594182170:web:7c9f8ea10ad3884f17e7a3",
    measurementId: "G-C9JMY8MBLQ"
  };
  const app = initializeApp(firebaseConfig);
  export const firebaseAuth = getAuth(app);