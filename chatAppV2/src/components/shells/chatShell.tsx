import { getFirestore, doc, collection } from "firebase/firestore";
import { app, auth } from "../../firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

const db = getFirestore(app);

function ChatShell() {

    const [messageBuffer, setMessageBuffer] = useState<string>("")

    const [messages, setMessages] = useState()

    const chatID = useParams()

    const [userSignedIn, setUserSignedIn] = useState<string>("")

    const [userUID, setUserUID] = useState<string>("")

    const [isLoading, setIsLoading] = useState(true)

    //const [chatID, setChatID] = useState()
    const getMessages = async () => {

        messagesCollection = collection(db, "privateChats")
       
        console.log(messagesCollection)

        if (userUID !== null) {

            console.log()

        }
    
        console.log("received chatID: " + chatID["chatID"])


    }
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("user is currently logged in");
                console.log(user);
                setUserSignedIn(true);
                setUserUID(user.uid);
                getMessages()
            } else {
                console.log("no user");
                setUserSignedIn(false);
            }
            setIsLoading(false);
        });
        return unsubscribe;

    }, [auth]);

    

    return (
        <>
            <h1>Chat chatID</h1>

            <div>chat messages insert array of messages here</div>

            <form method="POST">
                <input placeholder="message" value={messageBuffer} onChange={(e) => setMessageBuffer(e.target.value)}/>
                <input type="submit"/>
            </form>

            <p>
            </p>
        </>
    );
}

export default ChatShell;
