An E2EE Chat App


Tech Used:

Web Crypto API (for AES-GCM encryption (symmetric) and Elliptic Curve Diffie Hellman (ECDH) Key Exchange (asymmetric))

How it works:

1. User signup triggers ECDH key generation. 

Private key is encrypted and stored in localStorage. (if user wishes to input their privatekey if for example they clear their storage, they may do so. i just need to implement this with the localStorage.setItem() method)

Public key is stored on user's personal document

Access to the encrypted Private key is only possible if the user is authenticated to Firebase. I have made it so the privateKeyUnlocker (the symmetric key to )

2. User goes to dashboard

Where they can search through users on the Firestore DB and add friend via user UID.

Adding a friend creates an document in the FriendRequests Collection. This document can only be sent with the request_status == false as specified in the Sec_Rules. Document can only be modified if the user is the recipient of the friend request.

3. When a user accepts a friend request

document of the request in FriendRequests is updated so request_status == true

afterwards, a private chat is created in privateChats collection

4. When a user sends a message

it gets encrypted before it reaches the DB. All encryption is done client side.

5. 


As far as I know, the permissions I set in Firestore are secure. The permissions can be found in ./NOTES/firestore_schema/Sec_Rules


All symmetric encryption is done with Initialization Vectors (IV) to ensure randomness of the ciphertext.



