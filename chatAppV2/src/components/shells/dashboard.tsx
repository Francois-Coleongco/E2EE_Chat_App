import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { app, auth } from "../../firebase";
import { Navigate } from "react-router-dom";
import {
    DocumentData,
    arrayRemove,
    arrayUnion,
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import DOMPurify from "dompurify";

const db = getFirestore(app);

function Dashboard() {
    const [userSignedIn, setUserSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userUID, setUserUID] = useState<string>("");

    const [usrData, setUsrData] = useState<DocumentData | undefined>();

    const [pendingFriend, setPendingFriend] = useState<string>("");
    const [incomingFriend, setIncomingFriend] = useState<string>("");


    const Out_Handler = () => {
        signOut(auth)
            .then(() => {
                //signout success
                console.log("SUCCESS");
            })
            .catch(() => {
                //err
                setUserSignedIn(false);
            });
    };

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

    const pendingHandler = async (e: React.FormEvent) => {
        // this is where to initiate publicKey exchange.
        //
        // the user reads the other user's publicKey 
        //
        //

        // sym key is generated via deriveKey in cryptofuncs.

        // after derived, sym key is encrypted through AES-GCM the same way the privateKey was encrypted. the derivedKeyUnlocker is saved to localStorage (user can download this to backup as well). encrypted derived key is saved to the privChat document 

        // check if the symkey entry exists within the localStorage

       e.preventDefault();
        const usersDoc = doc(db, "users", userUID);
        const requestedDoc = doc(db, "users", pendingFriend);

        console.log(requestedDoc);
        try {
            await updateDoc(requestedDoc, {
                incomingFriends: arrayUnion(userUID),
            });
            await updateDoc(usersDoc, {
                pendingFriends: arrayUnion(pendingFriend),
            });

            const requestedData = await getDoc(requestedDoc)

            // get the requested's public key from firebase

            if (requestedData.exists()) {
                console.log(requestedData.data())
            }
            if (requestedData !== null) {
                console.log(requestedData.data())
            }
        } catch (error) {
            console.log("unable to add friend");
            return false;
        }
    };

    const incomingAddHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            // this is where to initiate publicKey exchang.
            //
            // the user reads the other user's publicKey 
            const usersDoc = doc(db, "users", userUID);
            const requestedDoc = doc(db, "users", incomingFriend);
            await updateDoc(requestedDoc, {
                friends: arrayUnion(userUID),
                pendingFriends: arrayRemove(userUID),
            });
            await updateDoc(usersDoc, {
                friends: arrayUnion(incomingFriend),
                incomingFriends: arrayRemove(incomingFriend),
            });
        } catch (error) {
            console.log("unable to add friend");
            return false;
        }
    };

    useEffect(() => {
        const retrieve = async () => {
            const ref = doc(db, "users", userUID)
            onSnapshot(ref, (doc) => {
                console.log("Current data: ", doc.data());
                setUsrData(doc.data())
            });
        }
        retrieve()
    }, [isLoading])

    console.log(usrData);
    console.log(typeof usrData);

    if (usrData && usrData.friends) {
        console.log(Object.keys(usrData.friends).length);
    }

    if (isLoading) {
        return <p>Loading...</p>; // Display a loading indicator while checking the authentication state
    }

    if (userSignedIn === true && isLoading === false) {
        return (
            <>
                <nav className="bg-gray-800">
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden"></div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex flex-shrink-0 items-center"></div>
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        <a
                                            href="/dashboard"
                                            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                                            aria-current="page"
                                        >
                                            Dashboard
                                        </a>
                                        <a
                                            href="friends"
                                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            Friends
                                        </a>
                                        <a
                                            href="incoming"
                                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            Incoming
                                        </a>
                                        <a
                                            href="pending"
                                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            Pending
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                <button
                                    type="button"
                                    className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <span className="absolute -inset-1.5"></span>
                                    <span className="sr-only">
                                        View notifications
                                    </span>
                                </button>
                                <div className="relative ml-3">
                                    <div>
                                        <button
                                            type="button"
                                            className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                            id="user-menu-button"
                                            aria-expanded="false"
                                            aria-haspopup="true"
                                        >
                                            <span className="absolute -inset-1.5"></span>
                                            <span className="sr-only">
                                                Open user menu
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:hidden" id="mobile-menu">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            <a
                                href="a"
                                className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white"
                                aria-current="page"
                            >
                                Dashboard
                            </a>
                            <a
                                href="#"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Friends
                            </a>
                            <a
                                href="#"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Incoming
                            </a>
                            <a
                                href="#"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Pending
                            </a>
                        </div>
                    </div>
                </nav>
                <button
                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                    onClick={Out_Handler}
                >
                    sign out
                </button>
                <h1>Dashboard</h1>
                <form onSubmit={pendingHandler}>
                    <input
                        name="pendingFriend"
                        placeholder="add friend (userUID)"
                        type="password"
                        required
                        onChange={(e) =>
                            setPendingFriend(DOMPurify.sanitize(e.target.value))
                        }
                    />
                    <br />
                    <button
                        type="submit"
                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                    >
                        send code
                    </button>
                </form>
                <br />
                <h3>your friends:</h3>
                {usrData !== undefined && (
                    <>
                        <div>
                            {Object.keys(usrData.friends).length === 0 && (
                                <p>no friends LLL</p>
                            )}
                            {Object.keys(usrData.friends).map((key, index) => (
                                <li key={index}>
                                    <a href={"friend/" + usrData.friends[key]}>{key}</a>
                                </li>
                            ))}
                        </div>
                        <h3>incoming:</h3>
                        <div>
                            {Object.keys(usrData.incomingFriends).length ===
                                0 && <p>no incoming friends</p>}
                            {Object.keys(usrData.incomingFriends).map(
                                (key, index) => (
                                    <li key={index}>
                                        <div>
                                        <form onSubmit={incomingAddHandler}>
                                        {usrData.incomingFriends[key]}
                                        <button type="submit" onClick={() => setIncomingFriend(usrData.incomingFriends[key])}>accept?</button>
                                        </form>
                                        </div>
                                    </li>
                                )
                            )}
                        </div>
                        <div>
                            <h3>pending:</h3>
                            {Object.keys(usrData.pendingFriends).length ===
                                0 && <p>no pending friends</p>}
                            {Object.keys(usrData.pendingFriends).map(
                                (key, index) => (
                                    <li key={index}>
                                        {usrData.pendingFriends[key]}
                                    </li>
                                )
                            )}
                        </div>
                    </>
                )}
            </>
        );
    } else {
        return <Navigate to={"/login"} />;
    }
}

export default Dashboard;
