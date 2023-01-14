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

export default {
	async fetch(
		request: Request,
		env: Env,
		context: ExecutionContext,
	): Promise<Response> {

		const init = {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			}
		}

		const host = 'https://accounts.spotify.com/api/token';
		const {
			REFRESH_TOKEN: refresh_token,
			CLIENT_ID: client_id,
			CLIENT_SECRET: client_secret,
			SPOTTY_KV
		} = env

		let bytes = new TextEncoder().encode(`${client_id}:${client_secret}`);

		function bytes2base64(bytes: Uint8Array) {
			let binary = '';
			const len = bytes.byteLength;
			for (let i = 0; i < len; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			return btoa(binary);
		}

		const postData = async (url = '') => {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': `Basic ${bytes2base64(bytes)}`,
				},
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token,
				})
			});
			return response.json();

		}

		const handler = async () => {
			const response: any = await postData(host)
			await SPOTTY_KV.put('access_token', response.access_token)
			return JSON.stringify('Data saved to KV.');
		}
		return new Response(await handler(), init)
	}
}