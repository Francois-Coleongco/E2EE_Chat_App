export const AES_Key_Generate = async () => { // bruh i cant stick to a naming convention idk LOL
    
    const key = crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,        },
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


async function decryptData(key: CryptoKey, iv: Uint8Array, encryptedContent: Uint8Array) {
  const ivBuffer = new Uint8Array(iv);
  const encryptedBuffer = new Uint8Array(encryptedContent);

  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );

  const decodedText = new TextDecoder().decode(decryptedContent);
  return JSON.parse(decodedText);
}

