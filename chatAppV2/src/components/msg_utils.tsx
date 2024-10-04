import { CollectionReference, DocumentSnapshot, QuerySnapshot, addDoc, onSnapshot, where, query } from "firebase/firestore"

export const sendMessage = async (
    messagesCollection: CollectionReference,
    messageBuffer: string,
    userUID: string,
    friendUID: string,
) => {
    addDoc(messagesCollection, {
        message: messageBuffer,
        sender: userUID,
        readers: [userUID, friendUID]
    })
    console.log("SUCCESS")
}


export const getMessages = (
    chatID: string | undefined,
    messagesCollection: CollectionReference,
    userUID: string,
) => {

    if (chatID !== undefined) {

        // get privchatdocument in privChatsCollection
        // get documents in the privchatdocument

        // using privChatDocRef, get the privChatMessages
        //
        console.log()
        //
        //
        console.log(chatID)
        const q = query(messagesCollection, where("readers", "array-contains", userUID))
        console.log(q)
        console.log(userUID)

        const unsubscribe_message_snapshot = onSnapshot(q, (QuerySnap: QuerySnapshot) => {


            const messages: string[] = []

            QuerySnap.forEach(
                (doc: DocumentSnapshot) => {
                    console.log(doc.data()) // this is the message
                    messages.push(JSON.stringify(doc.data()))
                }
            )
        }, (err: Error) => {
            console.log(err)
        })

        return unsubscribe_message_snapshot

    }

    else {
        console.log("WHOOPS chatID is somehow undefined...");
    }

}
