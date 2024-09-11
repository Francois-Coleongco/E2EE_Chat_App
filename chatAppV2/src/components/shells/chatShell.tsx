import { getFirestore, doc, collection, getDoc, onSnapshot, DocumentSnapshot, query, QuerySnapshot, where, addDoc } from "firebase/firestore";
import { app, auth } from "../../firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const db = getFirestore(app);

function ChatShell() {

    const chatID = useParams()["chatID"]
    const messagesCollection = collection(db, "privateChats/" + chatID + "/messages")
    const [messageBuffer, setMessageBuffer] = useState<string>("")
    const [messages, setMessages] = useState()

    const [userUID, setUserUID] = useState<string>("")
    const [friendUID, setFriendUID] = useState<string>("")

    const [userSignedIn, setUserSignedIn] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(true)

    const getChatRoom = async () => {

        if (chatID !== undefined) {
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
            }

        }
    }


    const getMessages = () => {

        if (chatID !== undefined) {

            // get privchatdocument in privChatsCollection
            // get documents in the privchatdocument

            // using privChatDocRef, get the privChatMessages
            //
            //
            //
            console.log(chatID)
            const q = query(messagesCollection, where("readers", "array-contains", userUID))
            console.log(q)
            console.log(userUID)

            console.log(auth)

            const unsubscribe_message_snapshot = onSnapshot(q, (QuerySnapshot) => {

                const messages: string[] = []

                QuerySnapshot.forEach(
                    (doc) => {
                        console.log(doc.data()) // this is the message
                        messages.push(JSON.stringify(doc.data()))
                    }
                )
            }, (err) => {
                console.log("poopsie whoopsie")
            })

            return unsubscribe_message_snapshot

        }

        else {
            console.log("WHOOPS chatID is somehow undefined...");
        }

    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        addDoc(messagesCollection, {
            message: messageBuffer,
            sender: userUID,
            readers: [userUID, friendUID]
        })
    }



    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("user is currently logged in");
                console.log(user);
                setUserSignedIn(true);
                setUserUID(user.uid);
            } else {
                console.log("no user");
                setUserSignedIn(false);
            }
            setIsLoading(false);
        });
        return unsubscribe;

    }, [auth]);



    useEffect(() => {
        console.log(userUID)

        getMessages();

        getChatRoom();
    }, [userUID])



    // focus on getting the messages sent first then add the key derivation then the encryption


    return (
        <>
            <h1>Chat chatID</h1>

            <div>chat messages insert array of messages here</div>

            <form onSubmit={sendMessage}>
                <input placeholder="message" value={messageBuffer} onChange={(e) => setMessageBuffer(e.target.value)} />
                <input type="submit" />
            </form>

            <p>
            </p>
        </>
    );
}

export default ChatShell;
