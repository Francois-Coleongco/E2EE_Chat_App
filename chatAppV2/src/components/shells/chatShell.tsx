import { getFirestore, doc } from "firebase/firestore";
import { app, auth } from "../../firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const db = getFirestore(app);

function ChatShell() {

    const [messageBuffer, setMessageBuffer] = useState("")

    const [messages, setMessages] = useState()

    const chatID = useParams()

    //const [chatID, setChatID] = useState()

    useEffect(() => {
        console.log(chatID)
        console.log(typeof(chatID))
        getMessages()
    })

    const getMessages = async () => {
    
        console.log("received chatID: " + chatID["chatID"])
        
        doc(db, )

    }

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
