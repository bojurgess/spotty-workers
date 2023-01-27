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

import refreshAccessTokens from 'shared/lib/refreshAccessTokens';

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

const worker = {  async scheduled(event: any, env: Env, ctx: any) {
		const kvNamespace = env.SPOTTY_KV;

		const aidanRefreshToken = await kvNamespace.get('refresh_token_aidan');
		const benoAccessToken = await kvNamespace.get('access_token_beno');

		function refreshTokens() {
			refreshAccessTokens(event, env, aidanRefreshToken).then((data) => {
				kvNamespace.put('access_token_aidan', data.access_token);
			})
			refreshAccessTokens(event, env, benoAccessToken).then((data) => {
				kvNamespace.put('access_token_beno', data.access_token);
			})
		}

		ctx.waitUntil(refreshTokens());
		console.log('cron processed', event.scheduledTime);
	},
};

export default worker;
