import { CollectionReference, DocumentSnapshot, QuerySnapshot, addDoc, onSnapshot, where, query, Timestamp } from "firebase/firestore"
import { AES_Decrypt_Message } from "./crypto_funcs/crypto_msgs"

export const sendMessage = async (
    messagesCollection: CollectionReference,
    messageBuffer: string,
    userUID: string,
    friendUID: string,
) => {
    addDoc(messagesCollection, {
        message: messageBuffer,
        sender: userUID,
        readers: [userUID, friendUID],
        time_sent: Timestamp.now()
    })
    //console.log("SUCCESS")
}

