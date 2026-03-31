import adapter from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
const config = { kit: { adapter: adapter({ out: "build" }) } };

export default config;
