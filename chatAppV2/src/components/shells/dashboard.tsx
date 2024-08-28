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
  const [userUID, setUserUID] = useState<string>("");
  const [requestedUID, setRequestedUID] = useState<string>("");

  const [usrData, setUsrData] = useState<DocumentData | undefined>();

  
  const [outgoing_requests, setOutgoingRequests] = useState<relationship_data[] | undefined>()

  const [incoming_requests, setIncomingRequests] = useState<relationship_data[] | undefined>()
  
  const [friendList, setFriendList] = useState<relationship_data[] | undefined>()
  
  const [acceptedFriendDoc, setAcceptedFriendDoc] = useState<DocumentReference | undefined>();

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



  useEffect(() => {
    
      const retrieve = async () => {
      const ref = doc(db, "users", userUID);
      onSnapshot(ref, (doc: DocumentSnapshot) => {
        console.log(userUID)
        console.log("Current data: ", doc.data());
        setUsrData(doc.data());
      });
    };

    const friendRequestsRetrieve = async () => {
      // okay im debating a bit whether it would be good to have friendRequests as a top level collection in firestore but i think for security purposes it would be good cuz then i can keep the user data unwritable completely from any other user other than the user that it belongs to

//      need to check if the document is set to status = true first
      let friends: relationship_data[] = []

      let outgoing: relationship_data[]  = []
      
      let incoming: relationship_data[]  = []

        const friendRequestsCollection = collection(db, "friendRequests")

        // query snapshot all documents relating to the current user and then filter manually instead of using the where clauses which would be several queries

        const q: Query = query(friendRequestsCollection, or(where("sender", "==", userUID), where("requested", "==", userUID)));


        onSnapshot(q, (querySnapshot: QuerySnapshot) => {
        


            querySnapshot.forEach((doc) => {
            const doc_ref = doc.ref
            const doc_data = doc.data()


            // KEEP THE DOC REFERENCES SO YOU CAN DELETE 
                if (doc_data.request_status === true) {
                    //is a friend
                    friends.push( { doc_ref: doc_ref, doc_data: doc_data })
                } else if (doc_data.sender === userUID) {

                    outgoing.push( { doc_ref: doc_ref, doc_data: doc_data })
                } else if (doc_data.requested === userUID) {
                    friends.push( { doc_ref: doc_ref, doc_data: doc_data })
                }

            });
        
            setFriendList(friends)
            setOutgoingRequests(outgoing)
            setIncomingRequests(incoming)

      });

 //     const receiver_

    };

    retrieve();
    friendRequestsRetrieve();

  }, [isLoading]);

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
    console.log("click3d")

    await addDoc(collection(db, "friendRequests"), {
      requested: requestedUID,
      sender: userUID,
      sender_pub_key: usrData?.publicKey,
      request_status: false,
      reqeusted_pub_key: "unknown"
    });


  };



  const incomingDocAddHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    // key exchange magic
    //
    console.log("clicked " + JSON.stringify(acceptedFriendDoc))

    // use accepted friend to search for a friend request that includes the userUID and the acceptedFriendUID

    // once found, set status = true
    // users are now friends which means you create the privChat now
    //

    
    
    if (acceptedFriendDoc !== undefined) {
        console.log(acceptedFriendDoc)
        setDoc(acceptedFriendDoc, { request_status: true, requested_pub_key: usrData?.publicKey }, { merge: true });
    }


   // update friendrequest in friendRequests to status being true which means it has been accepted
   // 
   // chat id would not be creaeted if the user just writes friend to their profile.



  };

  console.log(usrData);
  console.log(typeof usrData);


  if (isLoading) {
    return <p>Loading...</p>; // Display a loading indicator while checking the authentication state
  }

  if (userSignedIn === true && isLoading === false) {
    return (
      <>
        <button

          className="bg-blue-500"
          
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
              setRequestedUID(DOMPurify.sanitize(e.target.value))
            }
          />
          <br />
          <button
            type="submit"
            className="bg-blue-500"
          >
            send code
          </button>
        </form>
        <br />
        


        {usrData !== undefined && (
          <>

        <h3>your friends:</h3>

            { }

            { outgoing_requests !== undefined && (

            
                <>


        <h3>pending</h3>

                <div id="pending">

                {Object.keys(outgoing_requests).length === 0 && (
                    <p>nothing in sender_requests</p>
                    
                )}
                
                {outgoing_requests.map((doc , index) => {
                    return (
                        <li key={index}>
                        
                        to: {doc.doc_data.requested} 
                        </li>
                    )
                    
                })}

                </div>
                </>

            )}

            
            <h3>incomingDoc:</h3>
            { incoming_requests !== undefined && (
            
                <>
                <div id="incomingDoc">

                {Object.keys(receiver_requests_docs).length === 0 && (
                    <p>nothing in receiver_requests</p>
                )}
                
                {receiver_requests_docs.map((doc , index) => {
                    console.log(receiver_requests_data[index])
                    return (
                        <li key={index}>
                        <form onSubmit={incomingDocAddHandler}>
                            <button type="submit" className="bg-blue-500" onClick={() => {
                                setAcceptedFriendDoc(doc)
                            }}>
                            from: {receiver_requests_data[index].sender}
                            </button>
                        </form>
                        </li>
                    )
                    
                })}

                </div>
                </>

            )}

          </>
        )}
      </>
    );
  } else {
    return <Navigate to={"/login"} />;
  }
}

export default Dashboard;
