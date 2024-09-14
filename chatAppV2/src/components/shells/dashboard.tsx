import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
    DocumentData,
    addDoc,
    collection,
    doc,
    getFirestore,
    onSnapshot,
    setDoc,
    query,
    or,
    where,
    QuerySnapshot,
    DocumentReference,
    DocumentSnapshot,
    deleteDoc,
} from "firebase/firestore";
import DOMPurify from "dompurify";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { app, auth } from "../../firebase";
import { Query } from "firebase/firestore/lite";

const db = getFirestore(app);

interface relationship_data {
    doc_ref: DocumentReference,
    doc_data: DocumentData,

}

function Dashboard() {
    const [userSignedIn, setUserSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [disallowedActionTriggered, setDisallowedActionTriggered] = useState<boolean>(false)


    const [userUID, setUserUID] = useState<string>("");
    const [requestedUID, setRequestedUID] = useState<string>("");

    const [usrData, setUsrData] = useState<DocumentData | undefined>();


    const [outgoing_requests, setOutgoingRequests] = useState<relationship_data[] | undefined>()

    const [incoming_requests, setIncomingRequests] = useState<relationship_data[] | undefined>()

    const [friendList, setFriendList] = useState<relationship_data[] | undefined>()

    const [alreadyIn, setAlreadyIn] = useState<string[] | undefined>()


    const [acceptedFriendRelData, setAcceptedFriendRelData] = useState<relationship_data | undefined>();
    const [friendRequestID, setFriendRequestID] = useState<string>("");

    const [requestToDelete, setRequestToDelete] = useState<DocumentReference | undefined>()

    const [privChats, setPrivChats] = useState<string[] | undefined>()

    const Out_Handler = () => {
        signOut(auth)
            .then(() => {
                //signout success
                ;
            })
            .catch(() => {
                //err
                setUserSignedIn(false);
            });
    };


    const retrieve = async () => {
        try {
            const ref = doc(db, "users", userUID);
            onSnapshot(ref, (doc: DocumentSnapshot) => {
                setUsrData(doc.data());
            });
        }
        catch (err) {
        }

    };

    const friendRequestsRetrieve = () => {
        // okay im debating a bit whether it would be good to have friendRequests as a top level collection in firestore but i think for security purposes it would be good cuz then i can keep the user data unwritable completely from any other user other than the user that it belongs to

        //      need to check if the document is set to status = true first

        const friendRequestsCollection = collection(db, "friendRequests")
        // query snapshot all documents relating to the current user and then filter manually instead of using the where clauses which would be several queries

        const friendRequestsQuery: Query = query(friendRequestsCollection, or(where("sender", "==", userUID), where("requested", "==", userUID)));


        const unsubscribe_FR_snapshot = onSnapshot(friendRequestsQuery, (querySnapshot: QuerySnapshot<DocumentData>) => {

            let friends: relationship_data[] = []

            let outgoing: relationship_data[] = []

            let incoming: relationship_data[] = []

            let already: string[] = []


            querySnapshot.forEach((doc) => {
                const doc_ref = doc.ref
                const doc_data = doc.data()
                // KEEP THE DOC REFERENCES SO YOU CAN DELETE FRIEND REQUESTS
                if (doc_data.request_status === true) {
                    //is a friend
                    already.push(doc_data.requested)
                    friends.push({ doc_ref: doc_ref, doc_data: doc_data })
                } else if (doc_data.sender === userUID) {
                    already.push(doc_data.requested)
                    outgoing.push({ doc_ref: doc_ref, doc_data: doc_data })
                } else if (doc_data.requested === userUID) {
                    incoming.push({ doc_ref: doc_ref, doc_data: doc_data })
                }
            });

            console.log("BOOOOOOOO")


            console.log(friends)

            setFriendList(friends)
            setOutgoingRequests(outgoing)
            setIncomingRequests(incoming)
            setAlreadyIn(already)


        }, (err) => {
            console.log('whoopsie poopsie');
        })


        return unsubscribe_FR_snapshot
    }


    const privChatsRetrieve = () => {
        const privChatsCollection = collection(db, "privateChats")
        const privChatQuery: Query = query(privChatsCollection, where("members", "array-contains", userUID))

        const privChats: string[] = []
        const unsubscribe_PC_snapshot = onSnapshot(privChatQuery, (querySnapshot: QuerySnapshot<DocumentData>) => {
            querySnapshot.forEach((doc) => {
                privChats.push(doc.id)
            })

            setPrivChats(privChats)
        })

        return unsubscribe_PC_snapshot

    } //x5tPcPG5IjOunWfCpdDPwlZGZQA3


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserSignedIn(true);
                setUserUID(user.uid);

                console.log(user.uid)
            } else {
                ;
                setUserSignedIn(false);
            }
            setIsLoading(false);
        });
        return unsubscribe;
    }, [auth]);




    useEffect(() => {


        retrieve();
        friendRequestsRetrieve();
        privChatsRetrieve();


    }, [userUID]);
    // NEED TO ADD REMOVE REQUEST FUNCTION HERE

    const pendingHandler = async (e: React.FormEvent) => {
        // this is where to initiate publicKey exchange.
        //
        // the user reads the other user's publicKey
        //

        // sym key is generated via deriveKey in cryptofuncs.

        // after derived, sym key is encrypted through AES-GCM the same way the privateKey was encrypted. the derivedKeyUnlocker is saved to localStorage (user can download this to backup as well). encrypted derived key is saved to the privChat document

        // check if the symkey entry exists within the localStorage

        e.preventDefault();

        // MAKE REQUEST TO friendRequests COLLECTION
        //
        //


        console.log(alreadyIn)

        if (alreadyIn?.includes(requestedUID) || userUID === requestedUID) {
            setDisallowedActionTriggered(true)
        }
        else {

            await addDoc(collection(db, "friendRequests"), {
                requested: requestedUID,
                sender: userUID,
                sender_pub_key: usrData?.publicKey,
                request_status: false,
                requested_pub_key: "unknown"
            });

        }
    };



    const incomingDocAddHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        // key exchange magic
        //


        // use accepted friend to search for a friend request that includes the userUID and the acceptedFriendUID

        // once found, set status = true
        // users are now friends which means you create the privChat now
        //



        if (acceptedFriendRelData !== undefined) {

            await setDoc(acceptedFriendRelData.doc_ref, { request_status: true, requested_pub_key: usrData?.publicKey }, { merge: true });

            await addDoc(collection(db, "privateChats"), {
                members: [userUID, acceptedFriendRelData.doc_data.requested],
                friendRequestsID: friendRequestID
            })

            // this is what you use for the link in URL params => privChatDoc.id

        } else {

            console.log("error has occurred. please try this action again.")
        }


        // update friendrequest in friendRequests to status being true which means it has been accepted
        // 
        // chat id would not be creaeted if the user just writes friend to their profile.

        //create the chat shell instance here


    };

    const deleteOutgoingHandler = async (e: React.FormEvent) => {

        e.preventDefault()

        if (requestToDelete !== undefined) {
            await deleteDoc(requestToDelete)
        }
    }


    if (isLoading) {
        return <p>Loading...</p>; // Display a loading indicator while checking the authentication state
    }

    if (userSignedIn === true && isLoading === false) {
        return (
            <>
                <div className="min-h-screen bg-gray-100 p-8">
                    <button
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                        onClick={Out_Handler}
                    >
                        Sign Out
                    </button>

                    <h1 className="text-4xl font-extrabold mt-6 mb-4 text-gray-800">Dashboard</h1>

                    <form onSubmit={pendingHandler} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                        <label htmlFor="pendingFriend" className="block text-gray-700 font-medium mb-2">Add Friend (UserUID)</label>
                        {disallowedActionTriggered === true && (
                            <p>ACTION NOT ALLOWED</p>
                        )}
                        <input
                            id="pendingFriend"
                            name="pendingFriend"
                            placeholder="Enter userUID"
                            type="text"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 mb-4"
                            onChange={(e) => setRequestedUID(DOMPurify.sanitize(e.target.value))}
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                        >
                            Send Code
                        </button>
                    </form>

                    <div className="mt-8 max-w-md mx-auto">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Friends</h3>
                        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                            {/* List your friends here */}

                            {friendList !== undefined && privChats !== undefined && (
                                friendList.map((rel_data, index) => {

                                    let displayUID: string;

                                    const sender = rel_data.doc_data.sender

                                    const requested = rel_data.doc_data.requested

                                    if (sender !== userUID) {
                                        displayUID = sender
                                    } else {
                                        displayUID = requested
                                    }
                                    return (
                                        <div key={index}>
                                            <a href={"priv/" + privChats[index]}>{displayUID}</a>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Incoming Requests</h3>
                        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                            {/* List incoming requests here */}

                            {incoming_requests !== undefined && (
                                incoming_requests.map((rel_data, index) => {

                                    let displayUID: string = rel_data.doc_data.sender;

                                    return (
                                        <div key={index}>
                                            <form onSubmit={incomingDocAddHandler}>
                                                <li>{displayUID}</li>
                                                <button type="submit" onClick={
                                                    () => {
                                                        setAcceptedFriendRelData(rel_data)
                                                        setFriendRequestID(rel_data.doc_ref.id)
                                                    }
                                                }>accept</button>
                                            </form>
                                        </div>
                                    )
                                })
                            )}

                        </div>

                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Outgoing Requests</h3>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            {/* List outgoing requests here */}
                            {outgoing_requests !== undefined && (

                                outgoing_requests.map((rel_data, index) => {

                                    let displayUID: string = rel_data.doc_data.requested;

                                    return (
                                        <div key={index}>
                                            <form onSubmit={deleteOutgoingHandler}>
                                                <li>{displayUID}</li>
                                                <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={() => setRequestToDelete(rel_data.doc_ref)}>delete</button>
                                            </form>

                                        </div>
                                    )
                                })
                            )}


                        </div>
                    </div>
                </div>

            </>
        );
    } else {
        return <Navigate to={"/login"} />;
    }
}

export default Dashboard;
