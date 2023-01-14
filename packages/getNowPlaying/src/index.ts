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
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	SPOTIFY_TOKEN: string;
}

export default {
	async fetch(
		env: Env,
	): Promise<Response> {

		const host = 'https://api.spotify.com/'; // Spotify API
		const endpoint = 'v1/me/player/currently-playing'; // Endpoint
		const token = env.SPOTIFY_TOKEN; // Spotify token

		const init = {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			}
		}

		const getCurrentlyPlaying = async () => {
			const response = await fetch(`${host}${endpoint}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		
			if(response.status === 204) {
				return JSON.stringify({
					status: response.status,
					response: 'nothing playing...'
				})
			} else if (response.status === 200) {
				const data = await response.json();
				return JSON.stringify({
					status: response.status,
					response: data
				})
			}
		}

		return new Response(await getCurrentlyPlaying(), init)
	}
}