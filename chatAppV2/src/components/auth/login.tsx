import { useState, useEffect } from "react";
import DOMPurify from 'dompurify';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase"

const Login = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [userSignedIn, setUserSignedIn] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserSignedIn(true);
            } else {
                setUserSignedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);

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

    // if (isLoading) {
    //     return <p>Loading...</p>; // Display a loading indicator while checking the authentication state
    // }

    if (userSignedIn === false) {
        return (
            <>
                <form onSubmit={signInFirebase}>
                    <h1>Login</h1>
                    <input name="email" placeholder="Email" required onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))} />
                    <br />
                    <input name="password" placeholder="Password" type="password" required onChange={(e) => setPassword(DOMPurify.sanitize(e.target.value))} />
                    <br />
                    <button type="submit">click to log in</button>
                </form>

                <a href="/sign-up">dont have an account? sign up here!</a>
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


