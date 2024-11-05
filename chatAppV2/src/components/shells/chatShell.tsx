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

    const [chat_messages, setMessages] = useState<string[]>()

    const [userUID, setUserUID] = useState<string>("")
    const [friendUID, setFriendUID] = useState<string>("")

    const [friendRequestsID, setFriendRequestsID] = useState<string>("")

    const [symKey, setSymKey] = useState<CryptoKey>()

    const [loadingKeys, setLoadingKeys] = useState(true)

    const getChatRoom = async () => {

        if (chatID !== undefined) {
            //console.log(chatID)
            const chatDoc = await getDoc(doc(db, "privateChats", chatID))

            const chatDocData = chatDoc.data()
            //console.log(chatDoc.data())
            if (chatDocData !== undefined) {

                const members: string[] = chatDocData.members

                //console.log(members)

                members.forEach((member) => {
                    if (member !== userUID) {
                        //console.log("member: ", member)
                        setFriendUID(member)
                        return
                    }
                }
                )

                const frID = chatDocData.friendRequestsID

                setFriendRequestsID(frID)

                //console.log(frID)
            }
        }


    }


    useEffect(() => {
        console.log("THESE ARE THE MESSAGES", chat_messages)

    }, [chat_messages])


    const sendMessageHandler = async (e: React.FormEvent) => {
        e.preventDefault()

        //console.log(symKey)
        if (symKey !== undefined) {
            await AES_Encrypt_Message(messageBuffer, symKey).then((encrypted_message) => {
                //console.log(encrypted_message)
                sendMessage(messagesCollection, JSON.stringify(encrypted_message), userUID, friendUID)

                setMessageBuffer("")
            })
        }

    }


    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                //console.log("user is currently logged in");
                //console.log(user);
                setUserUID(user.uid);
            } else {
                //console.log("no user");
            }
        });
        return unsubscribe;

    }, [auth]);



    useEffect(() => {
        //console.log(userUID)
        //console.log(userUID)
        //console.log(chatID)
        const fetch_messages = async () => {
            if (chatID !== undefined) {
                const data = await getMessages(chatID, messagesCollection, userUID, symKey)

                OWIEGJOEWGJ THIS IS  T PRINTING console.log(data)

            }

            getChatRoom()
        }

        fetch_messages()

    }, [loadingKeys])


    useEffect(() => {
        //console.log(friendRequestsID)
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

            <div>


            </div>

            <form onSubmit={sendMessageHandler} className="fixed bottom-0 left-0 w-full bg-black p-4 shadow-md">
                <input placeholder="message" value={messageBuffer} onChange={(e) => setMessageBuffer(e.target.value)} />

                <button className="m-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-0 px-4 border border-gray-400 rounded shadow">send</button>
            </form >

            <p>
            </p>
        </>
    );
}

export default ChatShell;
