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

import refreshAccessTokens from 'shared/lib/refreshAccessTokens'

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const aidanRefreshToken = await env.SPOTTY_KV.get('refresh_token_aidan');
		const benoRefreshToken = await env.SPOTTY_KV.get('refresh_token_beno');

    await refreshAccessTokens(request, env, aidanRefreshToken).then((data) => {
			env.SPOTTY_KV.put('access_token_aidan', data.access_token);
		})

		await refreshAccessTokens(request, env, benoRefreshToken).then((data) => {
			env.SPOTTY_KV.put('access_token_beno', data.access_token);
		})

		return new Response('Pushed data to KV.')
  },
};