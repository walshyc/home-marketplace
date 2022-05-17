// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNE0RxzpdbEq2KOKV308Pro7oycd6BC0w",
    authDomain: "home-marketplace-350514.firebaseapp.com",
    projectId: "home-marketplace-350514",
    storageBucket: "home-marketplace-350514.appspot.com",
    messagingSenderId: "500982085178",
    appId: "1:500982085178:web:e0fee7790beb368fce2703",
    measurementId: "G-N7WR8SR4SG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);