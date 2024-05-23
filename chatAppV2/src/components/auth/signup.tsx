import { useState } from "react";
import DOMPurify from 'dompurify';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase"

const SignUp = () => {

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            setUserSignedUp(true)
        } else {
            // User is signed out
            // ...
        }
    });

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [userSignedUp, setUserSignedUp] = useState(false);

    const signUpFirebase = async (e: React.FormEvent) => {
        e.preventDefault();
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            // Signed in 
            setUserSignedUp(true);
            const user = userCredential.user.uid;
            console.log(user)
        })
    }


    if (userSignedUp === false || auth.currentUser === null) {
        return (
            <>
                <form onSubmit={signUpFirebase}>
                    <h1>Sign Up</h1>
                    <input placeholder="Email" required onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))} />
                    <br />
                    <input placeholder="Password" type="password" required onChange={(e) => setPassword(DOMPurify.sanitize(e.target.value))} />
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

export default SignUp