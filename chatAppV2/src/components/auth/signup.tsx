// on signupt create a user entry with an empty frinds list and incoming/outgoing request list

// they have full perms to their own document indicated by the presence of their uid within - update the rules

import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
} from "firebase/auth";
import { Navigate } from "react-router-dom";
import { app, auth } from "../../firebase";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { AES_Key_Generate, AES_Encrypt_JSON_Web_Key, AES_Decrypt_JSON_Web_Key } from "../crypto_funcs/encryption"
const db = getFirestore(app);


const createKeys = async () => {
    const keypair = await crypto.subtle.generateKey(
    {
        name: "ECDH",
        namedCurve: "P-521"
    },
    true,
    ["deriveKey", "deriveBits"]
    )
    return keypair;
}


const SignUp = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [userSignedIn, setUserSignedIn] = useState(false);
    const [userUID, setUserUID] = useState<string>("");
    const [exportedPublicKey, setExportedPublicKey] = useState<JsonWebKey>();
    const [exportedPrivateKey, setExportedPrivateKey] = useState<JsonWebKey>();
    const [privateKeyLink, setPrivateKeyLink] = useState<string>("#")
    const [privKeyUnlocker, setPrivKeyUnlocker] = useState<JsonWebKey>();
    const [signupClicked, setSignupClicked] = useState<boolean>(false);

    //
        //
        //IF USER WISHES TO THEY CAN DOWNLOAD THE PRIVATE KEY AS A FILE TO BACKUP.
        //THE PRIVATE KEY WILL BE ENCRYPTED VIA WEB CRYPTO API USING A RANDOMLY GENERATED ENCRYPTION KEY AND IV VIA AES.
        //
        //
        //WHEN USER LOGS IN, THE PRIVATE KEY IN THEIR LOCAL OR SESSION STORAGE WILL BE DECRYPTED AND USABLE FOR DIFFIE HELLMAN KEYEXCHANGE
        //
        //
    //
    // NOW IF THE USER WANTS TO UPLOAD THEIR PRIVATE KEY, THE CLIENT SIDE CODE IN ANOTHER PAGE (say: /reinit-key) WILL JSON.parse() THE JSON STRING FROM THE FILE 
    //
    // const [isLoading, setIsLoading] = useState(true);
    
    const generateKeys = () => {
        createKeys().then(keyPair => {
            console.log('Key Pair:', keyPair);
            console.log(keyPair.publicKey)
            console.log(keyPair.privateKey)
            // send publicKey to server
            //
            crypto.subtle.exportKey("jwk", keyPair.publicKey).then(expKey => {
                
                console.log('Exported Key:', expKey);
                
                setExportedPublicKey(expKey)

                console.log("executed create");

            });

            crypto.subtle.exportKey("jwk", keyPair.privateKey).then(expKey => {
            
                setExportedPrivateKey(expKey)

                const privateKeyBlob = new Blob([JSON.stringify(expKey)], { type: "application/json" })

                setPrivateKeyLink(URL.createObjectURL(privateKeyBlob))
            });
        });

    } 
    

    const writeToFireBase = async (exportedPublicKey: JsonWebKey | undefined, privKeyUnlocker_AES: JsonWebKey | undefined) => {
        
        console.log(userUID)
        const usersDoc = doc(db, "users", userUID);

        
        await setDoc(usersDoc, {
            publicKey: JSON.stringify(exportedPublicKey),
            privateKeyUnlocker: JSON.stringify(privKeyUnlocker_AES),
            friends: [],
            pendingFriends: [],
            incomingFriends: [],
        });

    }

    const writeToLocalStorage = async (privateKey: JsonWebKey | undefined) => {

        // ENCRYPT THE KEY FIRST AND SAVE THE ENCRYPTION KEY TO THE SERVER SO IT CAN LATER RETRIEVE THE PRIVATE KEY FROM STORAGE
        // using local storage because it is accessible from javascript and doesn't expire. just need to ensure its encrypted in storage to be safe
        //

        const AES_Key = await AES_Key_Generate()
        
        crypto.subtle.exportKey("jwk", AES_Key).then(expKey => {
                
                console.log('Exported Key:', expKey);
                
                setPrivKeyUnlocker(expKey)

                console.log("executed create");

        });

        const AES_results = await AES_Encrypt_JSON_Web_Key(privateKey, AES_Key)
        
        console.log(AES_results)

        // save to localStorage NOW

        localStorage.setItem("AES_Priv_Key", JSON.stringify(AES_results))
    
    }
    
    const signUpFirebase = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupClicked(true)

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


    useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserSignedIn(true);
                } else {
                    setUserSignedIn(false);
                }
            });

            return () => unsubscribe();
        }, []); // userUID is not set here, its set in signup function

    useEffect(() => {

        if (signupClicked === true) {
            console.log(userUID)
            generateKeys()

            console.log(userUID)
            console.log(exportedPublicKey)

            console.log(exportedPrivateKey)

            console.log(privKeyUnlocker)
        
            writeToLocalStorage(exportedPrivateKey)
            writeToFireBase(exportedPublicKey, privKeyUnlocker)

        }

    }, [userUID])

    

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
                <button type="submit">click to sign up</button>
            </form>


            <h2>your private key download will appear here:</h2>
            <a href={privateKeyLink} download={"privKey.json"}>here</a>

            <p>
                already have an account? log in <a href="/login">here</a>!
            </p>
        </>
    );
}   

export default SignUp;
