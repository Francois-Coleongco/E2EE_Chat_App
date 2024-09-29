import { doc, getDoc, Firestore } from "firebase/firestore"
import { deriveSharedSecret, AES_Decrypt_JSON_Web_Key } from "./encryption"

export const getPublicAndPrivateKeys = async (
    friendRequestsID: string,
    userUID: string,
    db: Firestore
) => {
    // access friendRequests to get get publicKeys
    // access user's localStorage and unlock the privateKey
    console.log(friendRequestsID)
    const friendDoc = await getDoc(doc(db, "friendRequests", friendRequestsID))


    const docData = friendDoc.data()

    if (docData !== undefined) {
        console.log("did i run?")
        const requested_user = docData.requested
        const sender_user = docData.sender
        let pubKey: JsonWebKey | undefined;

        if (requested_user === userUID) {
            pubKey = JSON.parse(docData.sender_pub_key)
        } else if (sender_user === userUID) {
            pubKey = JSON.parse(docData.requested_pub_key)
        }
        else {
            console.log("err")
        }
        console.log(pubKey)
        const encryptedPrivKeyAndIV = localStorage.getItem("AES_Priv_Key")

        if (encryptedPrivKeyAndIV !== null && pubKey !== undefined) {
            console.log(encryptedPrivKeyAndIV)

            const parsedEncryptedPrivKeyAndIV = JSON.parse(encryptedPrivKeyAndIV)


            const iv = new Uint8Array(parsedEncryptedPrivKeyAndIV.iv);
            const encryptedPrivKey = new Uint8Array(parsedEncryptedPrivKeyAndIV.encryptedContent);

            console.log(iv, encryptedPrivKey)

            const userDoc = await getDoc(doc(db, "users", userUID))

            const privKeyUnlocker = JSON.parse(userDoc.data()?.privateKeyUnlocker)

            console.log(privKeyUnlocker)

            //priv key unlocker ready

            const result = await AES_Decrypt_JSON_Web_Key(privKeyUnlocker, iv, encryptedPrivKey) // says privKeyUnlocker is not of type cryptokey
            const privateKey: JsonWebKey = JSON.parse(result)// this is the private key

            console.log("privateKey", privateKey)
            console.log("publicKey", pubKey)
            await deriveSharedSecret(privateKey, pubKey).then((crypto_key: CryptoKey) => {
                console.log(crypto_key) // ITS WORKINGGGG ITS WORKINGGG
                sessionStorage.setItem("sym-key", JSON.stringify(crypto_key)) // this will remain until the browser tab/window is closed
            })

        }

        // key (privKeyUnlocker) is found in the firestore user collection
    }
}


export const AES_Encrypt_Message = async (message: string) => {
    // message is plain text as a stringggg

    const encoded_message = new TextEncoder().encode(message)
    const key_string = sessionStorage.getItem("sym-key")

    if (key_string !== null) {
        const key = JSON.parse(key_string)
        const key_crypto = await crypto.subtle.importKey(
            'jwk', // Key format
            key, // Your JWK object
            {
                name: 'ECDH', // Specify ECDH for public keys
                namedCurve: 'P-521' // Specify the named curve used for the key
            },
            false, // Extractable
            ["deriveKey"] // No key usages for the public key
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        return window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key_crypto,
            encoded_message, do i need to add the iv here ? i forgot xd
        );
    }
}
