import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from '../../firebase';
import { Navigate } from "react-router-dom";
import DOMPurify from "dompurify";

function Friends() {

    const [friendCode, setFriendCode] = useState<string>('')

    const friendHandler = () => {

        // add friend

        create a request in the

    }

    return (
        <>
            <input name="friend_code" placeholder="friend code" value={friendCode} onChange={(e) => setFriendCode(DOMPurify.sanitize(e.target.value))} />

            <button onClick={friendHandler}>add friend</button>

        </>
    )


}


export default Friends