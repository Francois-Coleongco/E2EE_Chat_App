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


export const getMessages = async (
    chatID: string | undefined,
    messagesCollection: CollectionReference,
    userUID: string,
    key: CryptoKey | undefined,
) => {

    let data: string[] = []

    if (chatID !== undefined) {

        const q = query(messagesCollection, where("readers", "array-contains", userUID))

        onSnapshot(q, async (QuerySnap: QuerySnapshot) => {
            const promises: Promise<void>[] = [];

            QuerySnap.forEach((doc: DocumentSnapshot) => {
                const promise = (async () => {
                    const iv = JSON.parse(doc.data()?.message).iv;
                    const content = JSON.parse(doc.data()?.message).encrypted_content;

                    if (key !== undefined) {
                        const message = await AES_Decrypt_Message(content, iv, key);
                        console.log(message);
                        data.push(message);
                        console.log("populating data", data);
                    }
                })();

                promises.push(promise);
            });

            await Promise.all(promises);

            console.log("messages processed:", data);

            return data
        });
    }
}
