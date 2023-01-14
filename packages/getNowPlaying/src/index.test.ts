import { unstable_dev } from "wrangler";
import { describe, expect, it, beforeAll, afterAll } from "vitest";

describe("Worker", () => {
	let worker: any;

	beforeAll(async () => {
		worker = await unstable_dev(
			"src/index.ts",
			{ experimental: { disableExperimentalWarning: true } },
		);
	});

	afterAll(async () => {
		await worker.stop();
	})

	const statusRegex = new RegExp(/(200)|(204)/);

	it("Should return json or a 204 status code", async () => {
		const resp = await worker.fetch();

		if (resp) {
			const object = await resp.json();
			expect(object.status).toMatch(statusRegex)
		}
	})
})
