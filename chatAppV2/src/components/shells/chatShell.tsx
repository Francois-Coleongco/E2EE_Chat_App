import { getFirestore, doc, collection, getDoc, onSnapshot, DocumentSnapshot, QuerySnapshot, where, query, DocumentData, orderBy } from "firebase/firestore";
import { app, auth } from "../../firebase";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { getPublicAndPrivateKeys, AES_Encrypt_Message, AES_Decrypt_Message } from "../crypto_funcs/crypto_msgs";
import { getMessages, sendMessage } from "../msg_utils";
const db = getFirestore(app);
import { useScrollPosition } from 'react-use-scroll-position';


function ChatShell() {

    const chatID: string | undefined = useParams()["chatID"]
    const messagesCollection = collection(db, "privateChats/" + chatID + "/messages")
    const [messageBuffer, setMessageBuffer] = useState<string>("")

    const [encrypted_chat_messages, set_encrypted_messages] = useState<DocumentData[]>([])

    const [chat_messages, set_messages] = useState<string[]>([])

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
        console.log("THESE ARE THE MESSAGES", encrypted_chat_messages)
        if (encrypted_chat_messages !== undefined) {
            decrypt_messages(encrypted_chat_messages)
        }
    }, [encrypted_chat_messages])


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
                const data: string[] = []
                const q = query(messagesCollection, where("readers", "array-contains", userUID), orderBy('time_sent', 'asc'))

                onSnapshot(q, (QuerySnap: QuerySnapshot) => {
                    set_messages([])
                    const data: DocumentData[] = []
                    QuerySnap.forEach((doc) => {
                        console.log(doc.data())
                        data.push(doc.data())
                    })
                    set_encrypted_messages(data)
                })

                console.log("messages processed:", data);

            }

            getChatRoom()
        }

        fetch_messages()

    }, [loadingKeys])

    const decrypt_messages = (messages: DocumentData[]) => {

        messages.forEach((element) => {
			console.log("this is sender", element.sender)

            const iv = JSON.parse(element.message).iv
            const content = JSON.parse(element.message).encrypted_content
            if (symKey !== undefined) {
                AES_Decrypt_Message(content, iv, symKey).then((message) => {
                    console.log(message)
                    console.log(element.time_sent)
                    set_messages(prevMessages => [...prevMessages, message]);
                }).catch((err) => {
                    console.log(err)
                }
                )
            }
        })
    }

	const chat_feed = useRef(null)
	const [height, setHeight] = useState(0);  // State to store the height

	  const updateHeight = () => {
		if (chat_feed.current) {
		  setHeight(chat_feed.current.clientHeight);  // Get the height of the div
		}
	  };

    // focus on getting the messages sent first then add the key derivation then the encryption
const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ })
  }

  const isAtBottom = () => {
	  console.log(messagesEndRef.current?.scrollTop)
  }

	const {x, y} = useScrollPosition();
    useEffect(() => {
        //console.log(friendRequestsID)
        const crypto_key = getPublicAndPrivateKeys(friendRequestsID, userUID, db)

        crypto_key.then((key) => {

            setSymKey(key)
            setLoadingKeys(false)
        })

    }, [friendRequestsID])


    useEffect(() => {
        console.log(chat_messages);  // Logs the state after it updates
		updateHeight()
    }, [chat_messages]);  // This will run every time chat_messages is updated
  
  useEffect(() => {
	  if (y == height) {
		  scrollToBottom()
	  }
  }, [y])

    if (loadingKeys === true) {
        return <p>loading keys</p>
    }



    return (
        <>
            <h1 className="fixed top-0 h-10 left-0 w-full bg-gray-100 p-4 shadow-md">Chat ID: {chatID}</h1>

<div className="flex flex-col p-4 pb-16">
    <div className="flex-1 overflow-y-auto h-32" ref={chat_feed}>
        {chat_messages?.map((item, index) => (
            <div key={index} className="flex items-start" >
                <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                    <h4>{item}</h4>
                </div>
            </div>
        ))}
		<div ref={messagesEndRef}></div>
    </div>

<p>Scroll Position: {x, y}</p>
    <form onSubmit={sendMessageHandler} className="fixed bottom-0 h-16 left-0 w-full bg-gray-100 p-4 shadow-md">
        <input
            placeholder="Type a message"
            value={messageBuffer}
            onChange={(e) => setMessageBuffer(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
        />
    </form>
</div>
            <p>
            </p>
        </>
    );
}

export default ChatShell;
