import { doc, getFirestore, setDoc } from "firebase/firestore";
import { app, auth } from "../../firebase";

import * as forge from "node-forge";
import { useState, useEffect } from "react";
import { Navigate, useResolvedPath } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
const db = getFirestore(app);

function KeyPage() {
    const [userSignedIn, setUserSignedIn] = useState<boolean>(false);
    const [userUID, setUserUID] = useState<string>("");

    const [privKeyLink, setPrivKeyLink] = useState<string>("#");

    const [generatingKeyStatus, setGeneratingKeyStatus] =
        useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (usr) => {
            if (usr) {
                setUserSignedIn(true);
                setUserUID(usr.uid);
                setIsLoading(false);
            } else {
                setUserSignedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const keyGod = async () => {
        setGeneratingKeyStatus(true);

        const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
        const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);
        const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);

        console.log(keyPair);
        console.log(keyPair.publicKey);
        console.log(keyPair.privateKey);

        var privateKeyBlob = new Blob([privateKey], { type: "text/plain" });

        const usersDoc = doc(db, "users", userUID);

        console.log(usersDoc);
        await setDoc(usersDoc, {
            publicKey: publicKey,
        });

        console.log("executed create");

        // * forge.pki.privateKeyFromPem

        //! in the Users Directory in firebase, save the PUBLIC key. you will need to do some parsing for example getting rid of the header and footer of the key. when a user wants to send a message, you encrypt with the public key of the recipient by decoding the base64 and then using the encrypt utility in the node-forge lib

        // ! create user document with document id set to the userUID

        // save public key to firebase account

        // save private key to a file and also add it to local storage

        // if the user wishes to load their private key if for example the local storage got cleared, give user instructions on how to load the file in

        setPrivKeyLink(URL.createObjectURL(privateKeyBlob));
        setGeneratingKeyStatus(false);
    };

    if (isLoading === true) {
        return <>loading</>;
    }

    if (userSignedIn) {
        return (
            <>
                <p>{generatingKeyStatus}</p>
                <button onClick={keyGod}>Generate Private Key</button>
                <a href={privKeyLink} download={"privatekey.pem"}>
                    Download Your Private Key
                </a>
            </>
        );
    } else {
        return <Navigate to={"/login"} />;
    }
}

export default KeyPage;
