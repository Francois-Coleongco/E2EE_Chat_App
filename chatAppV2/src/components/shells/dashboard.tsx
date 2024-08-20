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
  where,
  QuerySnapshot,
  DocumentReference,
  getDoc,
  DocumentSnapshot,
} from "firebase/firestore";
import DOMPurify from "dompurify";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { app, auth } from "../../firebase";
import { Query } from "firebase/firestore/lite";

const db = getFirestore(app);

function Dashboard() {
  const [userSignedIn, setUserSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userUID, setUserUID] = useState<string>("");
  const [requestedUID, setRequestedUID] = useState<string>("");

  const [usrData, setUsrData] = useState<DocumentData | undefined>();

  const [sender_requests, setSenderRequests] = useState<DocumentData[] | undefined>()
  const [receiver_requests, setReceiverRequestsDoc] = useState<DocumentReference[] | undefined>()

  const [receiver_requests_data, setReceiverRequestsData] = useState<DocumentData[] | undefined>()
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
      const sender_q: Query = query(
        collection(db, "friendRequests"),
        where("sender", "==", userUID),
      );
          onSnapshot(sender_q, (querySnapshot: QuerySnapshot) => {
          const pending: DocumentData[] = [];
          querySnapshot.forEach((doc) => {
            pending.push(doc.data());
            console.log(pending)
          });

          setSenderRequests(pending)
      });

      const receiver_q: Query = query(
        collection(db, "friendRequests"),
        where("requested", "==", userUID),
      );
          onSnapshot(receiver_q, (querySnapshot: QuerySnapshot) => {
              const incomingDoc: DocumentReference[] = [];
              const incomingData: DocumentData[] = [];

              querySnapshot.forEach((doc) => {
                  incomingDoc.push(doc.ref);
                
                  console.log(incomingDoc)
                  incomingData.push(doc.data())
              });

          setReceiverRequestsDoc(incomingDoc)
          setReceiverRequestsData(incomingData)
      });


 //     const receiver_

    };

    retrieve();
    friendRequestsRetrieve();

  }, [isLoading]);



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
    //
    await addDoc(collection(db, "friendRequests"), {
      requested: requestedUID,
      sender: userUID,
      status: false,
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
        setDoc(acceptedFriendDoc, { status: true }, { merge: true });
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
                      href="incomingDoc"
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      incomingDoc
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
                  <span className="sr-only">View notifications</span>
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
                      <span className="sr-only">Open user menu</span>
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
                incomingDoc
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
              setRequestedUID(DOMPurify.sanitize(e.target.value))
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
            NEED TO REIMPLEMENT ALL FRIEND REQUEST RELATED DATA HERE

            { (sender_requests !== undefined) && (
            
                <>
                <div id="pending">

                {Object.keys(sender_requests).length === 0 && (
                    <p>nothing in sender_requests</p>
                )}
                
                {sender_requests.map((doc , index) => {
                    
                    return (
                        <li key={index}>
                        
                        to: {doc.requested} 
                        </li>
                    )
                    
                })}

                </div>
                </>

            )}

            
            <h3>incomingDoc:</h3>
            { (receiver_requests !== undefined && receiver_requests_data !== undefined) && (
            
                <>
                <div id="incomingDoc">

                {Object.keys(receiver_requests).length === 0 && (
                    <p>nothing in receiver_requests</p>
                )}
                
                {receiver_requests.map((doc , index) => {
                    console.log(receiver_requests_data[index])
                    return (
                        <li key={index}>
                        <form onSubmit={incomingDocAddHandler}>
                            <button type="submit" onClick={() => {
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
