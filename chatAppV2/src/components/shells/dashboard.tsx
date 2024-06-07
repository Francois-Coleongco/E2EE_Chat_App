import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { app, auth } from "../../firebase";
import { Navigate } from "react-router-dom";
import { arrayUnion, doc, getFirestore, updateDoc } from "firebase/firestore";
import DOMPurify from "dompurify";

const db = getFirestore(app);

function Dashboard() {
    const [userSignedIn, setUserSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userUID, setUserUID] = useState<string>("");
    const [pendingFriend, setPendingFriend] = useState<string>("");

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
        } catch (error) {
            console.log("unable to add friend");
            return false;
        }

        await updateDoc(usersDoc, {
            pendingFriends: arrayUnion(pendingFriend),
        });
    };

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
            </>
        );
    } else {
        return <Navigate to={"/login"} />;
    }
}

export default Dashboard;
