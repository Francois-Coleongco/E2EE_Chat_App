// on signupt create a user entry with an empty frinds list and incoming/outgoing request list

// they have full perms to their own document indicated by the presence of their uid within - update the rules

import { useState, useEffect } from "react";
import DOMPurify from 'dompurify';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase"
import * as forge from 'node-forge';

const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey)



console.log(keyPair)
console.log(keyPair.publicKey)
console.log(keyPair.privateKey)

var privateKeyBlob = new Blob([privateKey], { type: 'text/plain' });

// Create a download link


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  https://www.honeybadger.io/blog/encryption-and-decryption-in-typescript/


const SignUp = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [userSignedIn, setUserSignedIn] = useState(false);
    const [userUID, setUserUID] = useState<string>('')
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
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            // Signed in 
            setUserSignedIn(true);
            const user = userCredential.user.uid;
            setUserUID(user)
            console.log(user)
        })

        var downloadLink = document.createElement('a');
        downloadLink.download = 'private_key.pem';
        downloadLink.href = URL.createObjectURL(privateKeyBlob);
        downloadLink.textContent = 'Download Private Key';
        downloadLink.click();
// Trigger the download

        // * forge.pki.privateKeyFromPem

        in the Users Directory in firebase, save the PUBLIC key. you will need to do some parsing for example getting rid of the header and footer of the key. when a user wants to send a message, you encrypt with the public key of the recipient by decoding the base64 and then using the encrypt utility in the node-forge lib
        
        // save public key to firebase account

        // save private key to a file and also add it to local storage

        // if the user wishes to load their private key if for example the local storage got cleared, give user instructions on how to load the file in



    }




    //console.log(userSignedIn);

    // if (isLoading) {
    //     return <p>Loading...</p>; // Display a loading indicator while checking the authentication state
    // }

    if (userSignedIn === false) {
        return (
            <>
                <form onSubmit={signUpFirebase}>
                    <h1>Sign Up</h1>
                    <input name="email" placeholder="Email" required onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))} />
                    <br />
                    <input name="password" placeholder="Password" type="password" required onChange={(e) => setPassword(DOMPurify.sanitize(e.target.value))} />
                    <br />
                    <button type="submit">click to log in</button>
                </form>

                <p>already have an account? log in <a href="/login">here</a>!</p>
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


