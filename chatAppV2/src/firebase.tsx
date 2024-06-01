import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyCqa-iz28ioppu_Go9Ugu9hDnGaggo7yRg",
    authDomain: "chatappv2-138a3.firebaseapp.com",
    projectId: "chatappv2-138a3",
    storageBucket: "chatappv2-138a3.appspot.com",
    messagingSenderId: "610487137467",
    appId: "1:610487137467:web:663470206cf8f445f3a59e",
    measurementId: "G-699926KK3X"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);