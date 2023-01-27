export interface Env {
	SPOTTY_KV: KVNamespace;
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	CLIENT_ID: string;
	CLIENT_SECRET: string;
}

export default async function refreshAccessTokens(event: any, env: Env, refresh_token: string) {

  const init = {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    }
  }
  
  const host = 'https://accounts.spotify.com/api/token';

  function bytes2base64(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  const {
    CLIENT_ID: client_id,
    CLIENT_SECRET: client_secret,
    SPOTTY_KV: kvNamespace,
  } = env;

  let bytes = new TextEncoder().encode(`${client_id}:${client_secret}`);

  const response = await fetch(host, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${bytes2base64(bytes)}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  const data: any = await response.json();
  console.log(
    data,
    refresh_token,
    client_id,
    client_secret,
    bytes2base64(bytes)
  );

  return data;
}