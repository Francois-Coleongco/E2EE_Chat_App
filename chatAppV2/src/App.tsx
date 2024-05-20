import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import Login from './components/login'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);

//const analytics = getAnalytics(app);

function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
      <Login />
    </>
  )
}

export default App
