import { useState } from "react";
//import DOMPurify from 'dompurify';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";




const SignUp = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            const uid = user.uid;
            console.log("authenticated")
            // ! routing
            // ...
        } else {
            // User is signed out
            // ...
            console.log("unauthenticated")
        }
    });

    function loginSubmitHandler() {

        console.log(email)

        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // ...
                // ! routing
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ! reload page
            });

    }

    return (
        <>
            <h1>Login:</h1>

            <form method='POST' onSubmit={loginSubmitHandler}>

                <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <br />
                <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <br />
                <input type="submit" />

            </form>

            <p>no account? sign up <a href="sign-up">here</a></p>
        </>
    )
}

export default SignUp


