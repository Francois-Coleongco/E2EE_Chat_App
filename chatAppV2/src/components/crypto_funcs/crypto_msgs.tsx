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


    let pubKey: JsonWebKey | undefined;
    let privateKey: JsonWebKey | undefined;
    const docData = friendDoc.data()

    if (docData !== undefined) {
        console.log("did i run?")
        const requested_user = docData.requested
        const sender_user = docData.sender

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

        console.log(encryptedPrivKeyAndIV, pubKey)
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
            privateKey = JSON.parse(result)// this is the private key

            console.log("privateKey", privateKey)
            console.log("publicKey", pubKey)


        }

        // key (privKeyUnlocker) is found in the firestore user collection
    }

    const crypto_key = await deriveSharedSecret(privateKey, pubKey)
    return crypto_key

}




export const AES_Encrypt_Message = async (message: string, key: CryptoKey) => {
    // message is plain text as a stringggg

    const encoded_message = new TextEncoder().encode(message)


    console.log(encoded_message)
    console.log(key)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    console.log(iv)

    const encrypted_content = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoded_message,
    )

    console.log(encrypted_content)

    const stringified_encrypted_content = JSON.stringify(new Uint8Array(encrypted_content))

    console.log(stringified_encrypted_content)

    return {
        iv: iv,
        encrypted_content: stringified_encrypted_content,
    }

}

export const AES_Decrypt_Message = async (encrypted_message: string, iv: Uint8Array, key: CryptoKey) => {

    console.log(key)
    console.log(iv)

    console.log(encrypted_message)

    const encrypted_message_uint8_arr = JSON.parse(encrypted_message)

    console.log("encrypted_message_uint8_arr", encrypted_message_uint8_arr)

    const encrypted_message_arr_buff = encrypted_message_uint8_arr.buffer

    console.log("encrypted_message_arr_buff", encrypted_message_arr_buff)

    const decrypted_content = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encrypted_message_arr_buff,
    )

    console.log(decrypted_content)

    const decoded_content = new TextDecoder().decode(decrypted_content)

    return decoded_content

}
