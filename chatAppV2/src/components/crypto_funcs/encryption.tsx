export const AES_Key_Generate = async () => { // bruh i cant stick to a naming convention idk LOL

    const key = crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );

    return key
}

export const AES_Encrypt_JSON_Web_Key = async (unencrypted: JsonWebKey | undefined, key: CryptoKey) => {

    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM typically uses a 12-byte IV
    const encodedText = new TextEncoder().encode(JSON.stringify(unencrypted));

    const encryptedContent = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encodedText
    );

    return {
        iv: Array.from(iv),
        encryptedContent: Array.from(new Uint8Array(encryptedContent))
    };
}


// ROUGH IMPLEMENTATIN FOR DECRYPTION. I CHECK IT WORKS. JUST MAKE SURE TO USE THE .then FOR THE PROMISE ON THE LAST LINE
//
//    in actual implementation you will need to grab the privateKeyUnlocker from firebase and then JSON.parse(privateKeyUnlocker) to retrieve the unlock for the encrypted key 
//
//        console.log(localStorage.getItem("AES_Priv_Key"))
//
//        const a: string = localStorage.getItem("AES_Priv_Key")
//
//        const aParsed  = JSON.parse(a)
//
//        console.log(a) // says a is null but it isnt after setItem is called
//
//        console.log(aParsed)
//
//        console.log(aParsed.iv)
//
//        console.log(aParsed.encryptedContent)
//
//        
//
//        // time to decrypt with AES-GCM
//
//
//        const b = AES_Decrypt_JSON_Web_Key(AES_Key, aParsed.iv, aParsed.encryptedContent)
//
//        console.log(b.then())
//


export const deriveSharedSecret = async (privateKey: CryptoKey, publicKey: JsonWebKey) => {
    const importedKey = await crypto.subtle.importKey(
        'jwk',
        publicKey,
        {
            name: 'AES-GCM',
            length: 256 // Adjust this depending on the key length
        },
        true, // Extractable
        ['encrypt', 'decrypt']
    );
    const sharedSecret = await crypto.subtle.deriveKey(YIOU NEEDA FIX THE SHIT OUTTA THISSS why did you use deriveBits instead of derive key : sob: okay whatever you know what to do.OWEJGIOWRJIOGJWRIOG
        {
            name: "ECDH",
            public: importedKey
        },
        privateKey,
        256 // Length of the derived key in bits for use as the AES 256 encryptor
    );

    return new Uint8Array(sharedSecret);
};




export async function AES_Decrypt_JSON_Web_Key(key: JsonWebKey, iv: Uint8Array, encryptedContent: Uint8Array) {
    const cryptoKey = await crypto.subtle.importKey(
        'jwk',                               // Key format
        key,                                 // JWK key data
        { name: 'AES-GCM', length: 256 },    // Algorithm
        false,                               // Extractable
        ['decrypt']                          // Key usage
    );
    const decryptedContent = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,                            // Initialization vector
        },
        cryptoKey,                          // Imported AES-GCM key
        encryptedContent                    // Encrypted content
    );
    const decoder = new TextDecoder('utf-8');
    const jsonString = decoder.decode(decryptedContent);

    return jsonString
}

