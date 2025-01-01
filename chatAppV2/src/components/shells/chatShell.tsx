import { getFirestore, doc, collection, getDoc, onSnapshot, QuerySnapshot, where, query, DocumentData, orderBy } from "firebase/firestore";
import { app, auth } from "../../firebase";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { getPublicAndPrivateKeys, AES_Encrypt_Message, AES_Decrypt_Message } from "../crypto_funcs/crypto_msgs";
import { sendMessage } from "../msg_utils";
const db = getFirestore(app);
import { useScrollPosition } from 'react-use-scroll-position';


function ChatShell() {


	const chatID: string | undefined = useParams()["chatID"]
	const messagesCollection = collection(db, "privateChats/" + chatID + "/messages")
	const [messageBuffer, setMessageBuffer] = useState<string>("")

	const [encrypted_chat_messages, set_encrypted_messages] = useState<[string, DocumentData][]>([])

	const [chat_messages, set_messages] = useState<[string, string, string][]>([])

	const [userUID, setUserUID] = useState<string>("")
	const [friendUID, setFriendUID] = useState<string>("")

	const [friendRequestsID, setFriendRequestsID] = useState<string>("")

	const [symKey, setSymKey] = useState<CryptoKey>()

	const [loadingKeys, setLoadingKeys] = useState(true)
	const [loadingChat, setLoadingChat] = useState(true)

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
					const data: [string, DocumentData][] = []
					QuerySnap.forEach((doc) => {
						data.push([doc.id, doc.data()])
					})
					set_encrypted_messages(data)
				})


			}

			getChatRoom()
		}

		fetch_messages()

	}, [loadingKeys])

	const decrypt_messages = (messages: [string, DocumentData][]) => {

		messages.forEach((element) => {

			const id = element[0]
			const docDat = element[1]

			const iv = JSON.parse(docDat.message).iv
			const content = JSON.parse(docDat.message).encrypted_content
			if (symKey !== undefined) {
				AES_Decrypt_Message(content, iv, symKey).then((message) => {
					const sender = docDat.sender
					set_messages(prevMessages => [...prevMessages, [id, sender, message]]);
					setLoadingChat(false)
				}).catch((err) => {
					console.log(err)
				}
				)
			}
		})
	}

	const chat_feed = useRef(null)
	const [height, setHeight] = useState(0);  // State to store the height
	const [isUserAtBottom, setIsUserAtBottom] = useState(true);
	const updateHeight = () => {
		if (chat_feed.current) {
			setHeight(chat_feed.current.clientHeight);  // Get the height of the div
		}
	};

	// focus on getting the messages sent first then add the key derivation then the encryption
	const messagesEndRef = useRef(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({})
	}


	const { x, y } = useScrollPosition();
	useEffect(() => {
		//console.log(friendRequestsID)
		const crypto_key = getPublicAndPrivateKeys(friendRequestsID, userUID, db)

		crypto_key.then((key) => {

			setSymKey(key)
			setLoadingKeys(false)
		})

	}, [friendRequestsID])


	useEffect(() => {
		updateHeight()
	}, [chat_messages]);  // This will run every time chat_messages is updated

	const isAtBottom = () => {
		if (chat_feed.current) {
			const scrollTop = chat_feed.current.scrollTop;
			const scrollHeight = chat_feed.current.scrollHeight;
			const clientHeight = chat_feed.current.clientHeight;
			return scrollTop + clientHeight >= scrollHeight - 10;  // Allow a small buffer for precision
		}
		return false;
	};

	useEffect(() => {
		if (chat_feed.current) {
			const scrollTop = chat_feed.current.scrollTop;
			const scrollHeight = chat_feed.current.scrollHeight;
			const clientHeight = chat_feed.current.clientHeight;

				console.log(scrollTop, clientHeight, scrollHeight)
			// If the user is manually scrolling, they are not at the bottom
			if (scrollTop + clientHeight < scrollHeight - 10) {
				setIsUserAtBottom(false);
			} else {
				setIsUserAtBottom(true);
			}
		}
	}, [y]);

	useEffect(() => {
		// Scroll to the bottom only if the user is at the bottom of the chat
		if (isUserAtBottom && chat_messages.length > 0) {
			scrollToBottom();
		}
	}, [chat_messages]);

	return (
		<>
			<h1 className="fixed top-0 h-10 left-0 w-full bg-gray-100 p-4 shadow-md">Chat ID: {chatID} scroll y: {y} heihgt: {height}</h1>

			<div id="chat_feed" className="flex flex-col p-4 pb-16"  ref={chat_feed}>
				<div className="flex-1  h-32">
					{chat_messages?.map((item) => (
						<div key={item[0]} className="flex items-start mb-16" >
							{item[1] == userUID &&
								<div className="bg-black text-white p-3 rounded-lg max-w-xs">
									<h4>{item[2]}</h4>
								</div>
							}
							{item[1] == friendUID &&
								<div className="bg-gray-700 text-white p-3 rounded-lg max-w-xs absolute right-0">
									<h4>{item[2]}</h4>
								</div>
							}
						</div>
					))}
					<div ref={messagesEndRef}></div>
				</div>

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
