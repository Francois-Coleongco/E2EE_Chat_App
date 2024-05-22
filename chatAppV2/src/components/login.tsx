import { useState, useEffect } from "react";
//import DOMPurify from 'dompurify';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase"

const Login = () => {

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            const uid = user.uid;
            setUserSignedIn(true)
        } else {
            // User is signed out
            // ...
        }
    });

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [userSignedIn, setUserSignedIn] = useState(false);

    const signInFirebase = async (e: React.FormEvent) => {
        e.preventDefault();
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            // Signed in 
            setUserSignedIn(true);
            const user = userCredential.user.uid;
            console.log(user)
        })
    }

    //console.log(userSignedIn);

    if (userSignedIn === false || auth.currentUser === null) {
        return (
            <>
                <form onSubmit={signInFirebase}>
                    <h1>Sign In</h1>
                    <input placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                    <br />
                    <input placeholder="Password" type="password" required onChange={(e) => setPassword(e.target.value)} />
                    <br />
                    <button type="submit">click to log in</button>
                </form>

                <a href="/signUp">dont have an account? sign up here!</a>
            </>
        );
    }
    else {
        return (
            <>

                <Navigate to={"/dashboard"} />

            </>
        );
    }
}

export default Login


