// Generate photoreal Indian agent portraits + hero image (keyless, via Pollinations/FLUX).
// Run: node scripts/gen-faces.mjs
import { writeFile, mkdir } from "node:fs/promises";

const OUT = "public/agents";
const STYLE =
  "professional studio portrait, soft cinematic lighting, shallow depth of field, neutral warm grey background, 50mm lens, photorealistic, ultra detailed, sharp focus, looking at camera";

const JOBS = [
  {
    file: "kavach.jpg",
    seed: 41,
    w: 760,
    h: 960,
    prompt: `headshot of a confident Indian man in his mid-30s, short black hair, calm trustworthy expression, wearing a dark crew-neck sweater, ${STYLE}`,
  },
  {
    file: "samajh.jpg",
    seed: 52,
    w: 760,
    h: 960,
    prompt: `headshot of a warm friendly Indian woman in her late 20s, shoulder-length black hair, gentle smile, wearing a beige blazer, ${STYLE}`,
  },
  {
    file: "haq.jpg",
    seed: 63,
    w: 760,
    h: 960,
    prompt: `headshot of a wise approachable Indian man in his 40s, neat hair and light stubble, kind smile, wearing a navy shirt, ${STYLE}`,
  },
  {
    file: "sehat.jpg",
    seed: 74,
    w: 760,
    h: 960,
    prompt: `headshot of an Indian woman doctor in her 30s, hair tied back, caring expression, wearing a white coat over a blouse, ${STYLE}`,
  },
  {
    file: "hero.jpg",
    seed: 88,
    w: 1280,
    h: 1040,
    prompt: `cinematic editorial portrait of a thoughtful young Indian person looking slightly to the side, sitting in a warm minimal interior, soft natural window light, premium magazine photography, shallow depth of field, photorealistic, ultra detailed`,
  },
];

async function gen({ file, prompt, seed, w, h }) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt,
  )}?width=${w}&height=${h}&seed=${seed}&nologo=true&model=flux`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 90_000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(to);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 3000) throw new Error("too small");
      await writeFile(`${OUT}/${file}`, buf);
      console.log(`✓ ${file} (${(buf.length / 1024).toFixed(0)} KB)`);
      return true;
    } catch (e) {
      console.log(`… ${file} attempt ${attempt} failed: ${e.message}`);
    }
  }
  console.log(`✗ ${file} could not be generated`);
  return false;
}

await mkdir(OUT, { recursive: true });
for (const job of JOBS) {
  // sequential to be gentle on the free endpoint
  // eslint-disable-next-line no-await-in-loop
  await gen(job);
}
console.log("done");
