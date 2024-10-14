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


export const getMessages = (
    chatID: string | undefined,
    messagesCollection: CollectionReference,
    userUID: string,
    key: CryptoKey | undefined,
) => {

    if (chatID !== undefined) {

        // get privchatdocument in privChatsCollection
        // get documents in the privchatdocument

        // using privChatDocRef, get the privChatMessages
        //
        //console.log(chatID)
        const q = query(messagesCollection, where("readers", "array-contains", userUID))
        //console.log(q)
        //console.log(userUID)

        const unsubscribe_message_snapshot = onSnapshot(q, (QuerySnap: QuerySnapshot) => {


            const messages: string[] = []

            QuerySnap.forEach(
                (doc: DocumentSnapshot) => {
                    //console.log(doc.data()) // this is the message
                    //console.log(key)
                    const iv = JSON.parse(doc.data()?.message).iv
                    //console.log(iv)
                    const content = JSON.parse(doc.data()?.message).encrypted_content
                    //console.log(content)
                    if (key !== undefined) {
                        //console.log("hit here")
                        AES_Decrypt_Message(content, iv, key).then((message) => {
                            console.log("should show message")
                            console.log(message)
                        }).catch((err) => {
                            console.log(err)
                        }
                        )
                        //console.log("test")
                    }
                    messages.push(JSON.stringify(doc.data()))
                }
            )

        }, (err: Error) => {
            //console.log(err)
        })


        return unsubscribe_message_snapshot

    }

    else {
        //console.log("WHOOPS chatID is somehow undefined...");
    }

}
