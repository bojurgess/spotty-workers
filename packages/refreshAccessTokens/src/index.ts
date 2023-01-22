/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

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
	REFRESH_TOKEN: string;
	CLIENT_ID: string;
	CLIENT_SECRET: string;
}

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

async function getSpotifyData(event: any, env: any) {  // Fetch some data  console.log('cron processed', event.scheduledTime);

	const {
		CLIENT_ID: client_id,
		CLIENT_SECRET: client_secret,
		SPOTTY_KV: kvNamespace,
		REFRESH_TOKEN: refresh_token,
	} = env;

	let bytes = new TextEncoder().encode(`${client_id}:${client_secret}`);

	const response = await fetch(host, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${bytes2base64(bytes)}`,
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token,
		}),
	});

	const data: any = await response.json();
	console.log(data, refresh_token, client_id, client_secret, bytes2base64(bytes));
	await kvNamespace.put('access_token', data.access_token)

	console.log('cron processed', event.scheduledTime);
	return data;
}

const worker = {  async scheduled(event: any, env: any, ctx: any) {
		ctx.waitUntil(getSpotifyData(event, env));  
	},
};

export default worker;
