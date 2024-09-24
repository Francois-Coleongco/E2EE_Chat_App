import { getFirestore, doc, collection, getDoc, onSnapshot, DocumentSnapshot, query, QuerySnapshot, where, addDoc, getDocs } from "firebase/firestore";
import { app, auth } from "../../firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { AES_Decrypt_JSON_Web_Key, deriveSharedSecret } from "../crypto_funcs/encryption"
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

    const [friendRequestsID, setFriendRequestsID] = useState<string>("")

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

    const getPublicAndPrivateKeys = async () => {
        // access friendRequests to get get publicKeys
        // access user's localStorage and unlock the privateKey
        console.log(friendRequestsID)
        const friendDoc = await getDoc(doc(db, "friendRequests", friendRequestsID))

        const docData = friendDoc.data()


        if (docData !== undefined) {
            console.log("did i run?")
            const requested_user = docData.requested
            const sender_user = docData.sender
            let pubKey: JsonWebKey | undefined;

            if (requested_user === userUID) {
                pubKey = JSON.parse(docData.sender_pub_key)
            } else if (sender_user === userUID) {
                pubKey = JSON.parse(docData.requested_pub_key)
            }
            else {
                console.log("err")
            }
            console.log(pubKey)
            const encryptedPrivKeyAndIV = localStorage.getItem("AES_Priv_Key")

            if (encryptedPrivKeyAndIV !== null && pubKey !== undefined) {
                console.log(encryptedPrivKeyAndIV)

                const parsedEncryptedPrivKeyAndIV = JSON.parse(encryptedPrivKeyAndIV)


                const iv = new Uint8Array(parsedEncryptedPrivKeyAndIV.iv);
                const encryptedPrivKey = new Uint8Array(parsedEncryptedPrivKeyAndIV.encryptedContent);

                console.log(iv, encryptedPrivKey)

                const userDoc = await getDoc(doc(db, "users", userUID))

                const privKeyUnlocker = JSON.parse(userDoc.data()?.privateKeyUnlocker)

                console.log(privKeyUnlocker)

                //priv key unlocker ready

                const result = await AES_Decrypt_JSON_Web_Key(privKeyUnlocker, iv, encryptedPrivKey) // says privKeyUnlocker is not of type cryptokey
                const privateKey: JsonWebKey = JSON.parse(result)// this is the private key

                console.log("privateKey", privateKey)
                console.log("publicKey", pubKey)
                await deriveSharedSecret(privateKey, pubKey).then((crypto_key) => {
                    console.log(crypto_key) // ITS WORKINGGGG ITS WORKINGGG
                    sessionStorage.setItem("sym-key", JSON.stringify(crypto_key))
                })


            }

            // key (privKeyUnlocker) is found in the firestore user collection
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
                console.log(err)
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

        console.log(userUID)
        console.log(chatID)
        getChatRoom()

    }, [userUID, chatID])


    useEffect(() => {
        console.log(friendRequestsID)
        getPublicAndPrivateKeys()
    }, [friendRequestsID])

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
