let sessionKey = null;

async function getSessionKey() {
  if (sessionKey) return sessionKey;
  sessionKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return sessionKey;
}

export async function encryptKey(plainText) {
  const key = await getSessionKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return { ciphertext, iv };
}

export async function decryptKey(encrypted) {
  const key = await getSessionKey();
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: encrypted.iv },
    key,
    encrypted.ciphertext
  );
  return new TextDecoder().decode(decrypted);
}
