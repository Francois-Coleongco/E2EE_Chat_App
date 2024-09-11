import { getFirestore, doc, collection, getDoc, onSnapshot, DocumentSnapshot, query, QuerySnapshot, where } from "firebase/firestore";
import { app, auth } from "../../firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const db = getFirestore(app);

function ChatShell() {

    const [messageBuffer, setMessageBuffer] = useState<string>("")

    const [messages, setMessages] = useState()

    const chatID = useParams()["chatID"]

    const [userSignedIn, setUserSignedIn] = useState<boolean>(false)

    const [userUID, setUserUID] = useState<string>("")

    const [isLoading, setIsLoading] = useState(true)

    //const [chatID, setChatID] = useState()

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
    }, [userUID])

    const getMessages = () => {

        if (userUID !== "") {
            console.log(userUID)
        }

        if (chatID !== undefined) {

            // get privchatdocument in privChatsCollection
            // get documents in the privchatdocument

            // using privChatDocRef, get the privChatMessages
            //
            //
            //
            console.log(chatID)
            const q = query(collection(db, "privateChats/" + chatID + "/messages"), where("readers", "array-contains", userUID))
            console.log(q)
            console.log(userUID)

            console.log(auth)

            const unsubscribe_message_snapshot = onSnapshot(q, (QuerySnapshot) => {

                QuerySnapshot.forEach(
                    (doc) => {
                        console.log(doc.data()) // this is the message
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

    // focus on getting the messages sent first then add the key derivation then the encryption


    return (
        <>
            <h1>Chat chatID</h1>

            <div>chat messages insert array of messages here</div>

            <form method="POST">
                <input placeholder="message" value={messageBuffer} onChange={(e) => setMessageBuffer(e.target.value)} />
                <input type="submit" />
            </form>

            <p>
            </p>
        </>
    );
}

export default ChatShell;
