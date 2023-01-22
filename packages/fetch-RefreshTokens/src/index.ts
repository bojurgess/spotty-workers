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

import getSpotifyData from 'shared/lib/getSpotifyData'

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    await getSpotifyData(request, env)

		return new Response('Pushed data to KV.')
  },
};