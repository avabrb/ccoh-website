// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRYNzy7fGtAJ35YB08TJaa11GH1Jq6-mY",
  authDomain: "ccoh-website-1d1f9.firebaseapp.com",
  projectId: "ccoh-website-1d1f9",
  storageBucket: "ccoh-website-1d1f9.firebasestorage.app",
  messagingSenderId: "56949729453",
  appId: "1:56949729453:web:85b5cb14e665a4873dbe24",
  measurementId: "G-46KQ778WVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);