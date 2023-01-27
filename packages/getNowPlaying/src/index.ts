/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { l } from "vitest/dist/index-2dd51af4";

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
}

export default {
	async fetch(
		request: Request,
		env: Env,
		context: ExecutionContext,
	): Promise<Response> {

		const url = request.url

		function getParameterByName(name: string) {
			name = name.replace(/[\[\]]/g, '\\$&')
			name = name.replace(/\//g, '')
			var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
				results = regex.exec(url)
	
			if (!results) return null
			else if (!results[2]) return ''
			else if (results[2]) {
				results[2] = results[2].replace(/\//g, '')
			}
			
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		}

		const host = 'https://api.spotify.com/'; // Spotify API
		const endpoint = 'v1/me/player/currently-playing'; // Endpoint
		const kvNamespace = env.SPOTTY_KV; // KV Namespace

		const accessTokenAidan = await kvNamespace.get('access_token_beno');
		const accessTokenBeno = await kvNamespace.get('access_token_beno');

		let init = {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin': '*',
			},
			status: 200,
		}

		const getCurrentlyPlaying = async () => {

			let user = getParameterByName('user')
			console.log(user)

			let token

			if (user === null) {
				init.status = 400
				return JSON.stringify({
					response: 'No user specified'
				})
			} else if (user !== 'aidan' && user !== 'beno') {
				init.status = 400
				return JSON.stringify({
					response: 'Invalid user specified'
				})
			} else if (user === 'aidan') {
				token = accessTokenAidan
			} else if (user === 'beno') {
				token = accessTokenBeno
			}

			const response = await fetch(`${host}${endpoint}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		
			if(response.status === 204) {
				init.status = response.status
				return
			} else if (response.status === 200) {
				const data = await response.json();
				init.status = response.status
				return JSON.stringify({
					response: data
				})
			} else {
				init.status = response.status
				return JSON.stringify({
					response: response.statusText
				})
			}
		}


		
		return new Response(await getCurrentlyPlaying(), init)
	}
}