import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from '../../firebase';
import { Navigate } from "react-router-dom";

function Dashboard() {

    const [userSignedIn, setUserSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const Out_Handler = () => {

        signOut(auth).then(() => {
            //signout success
            console.log("SUCCESS")
        }).catch((error) => {
            //err
        });


    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('user is currently logged in');
                console.log(user)
                setUserSignedIn(true);
            } else {
                console.log('no user');
                setUserSignedIn(false)
            }
            setIsLoading(false);
        });
        return unsubscribe;
    }, [auth]);

    if (isLoading) {
        return <p>Loading...</p>; // Display a loading indicator while checking the authentication state
    }


    if (userSignedIn === true && isLoading === false) {
        return (
            <>
                <button onClick={Out_Handler}>sign out</button>
                <h1>Dashboard</h1>

            </>
        )
    }

    else {
        return (
            <Navigate to={"/login"} />
        )
    }




}


export default Dashboard


