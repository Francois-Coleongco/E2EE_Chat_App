import { getFirestore, doc, collection, getDoc } from "firebase/firestore";
import { app, auth } from "../../firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { getPublicAndPrivateKeys, AES_Encrypt_Message } from "../crypto_funcs/crypto_msgs";
import { getMessages, sendMessage } from "../msg_utils";
const db = getFirestore(app);

function ChatShell() {

    const chatID: string | undefined = useParams()["chatID"]
    const messagesCollection = collection(db, "privateChats/" + chatID + "/messages")
    const [messageBuffer, setMessageBuffer] = useState<string>("")

    const [userUID, setUserUID] = useState<string>("")
    const [friendUID, setFriendUID] = useState<string>("")

    const [friendRequestsID, setFriendRequestsID] = useState<string>("")

    const [symKey, setSymKey] = useState<CryptoKey>()

    const [loadingKeys, setLoadingKeys] = useState(true)

    const getChatRoom = async () => {

        if (chatID !== undefined) {
            console.log(chatID)
            const chatDoc = await getDoc(doc(db, "privateChats", chatID))

            const chatDocData = chatDoc.data()
            console.log(chatDoc.data())
            if (chatDocData !== undefined) {

                const members: string[] = chatDocData.members

                console.log(members)

                members.forEach((member) => {
                    if (member !== userUID) {
                        console.log("member: ", member)
                        setFriendUID(member)
                        return
                    }
                }
                )

                const frID = chatDocData.friendRequestsID

                setFriendRequestsID(frID)

                console.log(frID)
            }
        }


    }




    const sendMessageHandler = async (e: React.FormEvent) => {
        e.preventDefault()
        // for now just 
        console.log(messageBuffer)

        console.log(symKey)
        if (symKey !== undefined) {
            await AES_Encrypt_Message(messageBuffer, symKey).then((encrypted_message) => {
                console.log(encrypted_message)
                sendMessage(messagesCollection, JSON.stringify(encrypted_message), userUID, friendUID)
            })
        }

    }


    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("user is currently logged in");
                console.log(user);
                setUserUID(user.uid);
            } else {
                console.log("no user");
            }
        });
        return unsubscribe;

    }, [auth]);



    useEffect(() => {
        console.log(userUID)
        console.log(userUID)
        console.log(chatID)

        if (chatID !== undefined) {

            getMessages(chatID, messagesCollection, userUID, symKey);

        }
        getChatRoom()

    }, [userUID, chatID])


    useEffect(() => {
        console.log(friendRequestsID)
        const crypto_key = getPublicAndPrivateKeys(friendRequestsID, userUID, db)

        crypto_key.then((key) => {

            setSymKey(key)
            setLoadingKeys(false)
        })
    }, [friendRequestsID])

    // focus on getting the messages sent first then add the key derivation then the encryption

    if (loadingKeys === true) {
        return <p>loading keys</p>
    }

    return (
        <>
            <h1>Chat chatID</h1>

            <div>chat messages insert array of messages here</div>

            <form onSubmit={sendMessageHandler}>
                <input placeholder="message" value={messageBuffer} onChange={(e) => setMessageBuffer(e.target.value)} />
                <input type="submit" />
            </form>

            <p>
            </p>
        </>
    );
}

export default ChatShell;
