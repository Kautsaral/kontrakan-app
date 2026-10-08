const SESSION_MAX_AGE = 60 * 60 * 24;

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET belum dikonfigurasi.");
  }

  return secret;
}

function base64UrlEncode(value) {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : new Uint8Array(value);

  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value) {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function createSignature(payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  return crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
}

async function verifySignature(payload, signature) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["verify"],
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(signature),
    encoder.encode(payload),
  );
}

export async function createSessionToken() {
  const timestamp = Date.now().toString();
  const signature = await createSignature(timestamp);

  return `${base64UrlEncode(timestamp)}.${base64UrlEncode(signature)}`;
}

export async function verifySessionToken(token) {
  try {
    if (!token) {
      return false;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return false;
    }

    const [encodedTimestamp, encodedSignature] = parts;

    const timestamp = new TextDecoder().decode(
      base64UrlDecode(encodedTimestamp),
    );

    const timestampNumber = Number(timestamp);

    if (!Number.isFinite(timestampNumber)) {
      return false;
    }

    const age = Date.now() - timestampNumber;

    if (age < 0 || age > SESSION_MAX_AGE * 1000) {
      return false;
    }

    const payload = timestamp;
    const valid = await verifySignature(
      payload,
      encodedSignature,
    );

    return valid;
  } catch (error) {
    console.error("Session verification error:", error);
    return false;
  }
}

export { SESSION_MAX_AGE };