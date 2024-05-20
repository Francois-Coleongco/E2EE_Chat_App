import { useState } from "react";
import DOMPurify from 'dompurify';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

const Login = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    function loginSubmitHandler() {

        console.log(email)

        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });

    }

    return (
        <>
            <h1>Login:</h1>

            <form method='POST' onSubmit={loginSubmitHandler}>

                <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))} />
                <br />
                <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(DOMPurify.sanitize(e.target.value))} />
                <br />
                <input type="submit" />

            </form>

            <p>no account? sign up <a href="">here</a></p>
        </>
    )
}

export default Login


