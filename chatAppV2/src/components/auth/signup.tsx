// on signupt create a user entry with an empty frinds list and incoming/outgoing request list

// they have full perms to their own document indicated by the presence of their uid within - update the rules

import { useState, useEffect } from "react";
import DOMPurify from "dompurify";

import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebase";

import { Navigate } from "react-router-dom";


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  https://www.honeybadger.io/blog/encryption-and-decryption-in-typescript/

const SignUp = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [userSignedIn, setUserSignedIn] = useState(false);
    const [userUID, setUserUID] = useState<string>("");
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

    const signUpFirebase = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const userCreds = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            setUserUID(userCreds.user.uid);
        } catch (err) {
            return <Navigate to="/sign-up" />;
        }
    };

    //console.log(userSignedIn);

    // if (isLoading) {
    //     return <p>Loading...</p>; // Display a loading indicator while checking the authentication state
    // }

    if (auth.currentUser === null) {
        return (
            <>
                <form onSubmit={signUpFirebase}>
                    <h1>Sign Up</h1>
                    <input
                        name="email"
                        placeholder="Email"
                        required
                        onChange={(e) =>
                            setEmail(DOMPurify.sanitize(e.target.value))
                        }
                    />
                    <br />
                    <input
                        name="password"
                        placeholder="Password"
                        type="password"
                        required
                        onChange={(e) =>
                            setPassword(DOMPurify.sanitize(e.target.value))
                        }
                    />
                    <br />
                    <button type="submit">click to log in</button>
                </form>

                <p>
                    already have an account? log in <a href="/login">here</a>!
                </p>
            </>
        );
    } else {
        return (
            <>
                <Navigate to={"/key-page"} />
            </>
        );
    }
};

export default SignUp;
