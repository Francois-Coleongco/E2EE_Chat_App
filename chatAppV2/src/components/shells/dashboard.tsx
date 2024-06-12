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
        } catch (error) {
            console.log("unable to add friend");
            return false;
        }
    };

    const incomingHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
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
        console.log("this rendered");
        const retrieveData = async () => {
            try {
                console.log("new");
                const usersDocSnap = await getDoc(doc(db, "users", userUID));
                console.log(usersDocSnap);
                if (usersDocSnap.exists()) {
                    console.log("new");
                    setUsrData(usersDocSnap.data());
                    console.log("got past");
                }
            } catch (error) {}
        };
        retrieveData();
    }, [isLoading]);

    console.log(usrData);
    console.log(typeof usrData);

    if (isLoading) {
        return <p>Loading...</p>; // Display a loading indicator while checking the authentication state
    }

    if (userSignedIn === true && isLoading === false) {
        return (
            <>
                <button onClick={Out_Handler}>sign out</button>
                <h1>Dashboard</h1>
                <form onSubmit={pendingHandler}>
                    <input
                        name="pendingFriend"
                        placeholder="state userUID"
                        type="password"
                        required
                        onChange={(e) =>
                            setPendingFriend(DOMPurify.sanitize(e.target.value))
                        }
                    />
                    <button type="submit">send code</button>
                </form>
                add friend
                {usrData !== undefined &&
                    Object.keys(usrData?.pendingFriends).map((key, index) => (
                        <li key={index}>{usrData?.pendingFriends[key]}</li>
                    ))}
            </>
        );
    } else {
        return <Navigate to={"/login"} />;
    }
}

export default Dashboard;
