import sharp from "sharp";
import fs from "fs";
import path from "path";

export async function generateVariants(
  basePath: string,
  count: number,
  options: any
) {
  const outDir = `public/generated/${Date.now()}`;
  fs.mkdirSync(outDir, { recursive: true });

  const results = [];

  for (let i = 0; i < count; i++) {
    let img = sharp(basePath).resize(1000, 1000, { fit: "contain" });

    if (options.rotate) img = img.rotate(Math.random() * 10 - 5);
    if (options.bg) img = img.flatten({ background: options.bg });

    const out = path.join(outDir, `v_${i}.jpg`);
    await img.jpeg({ quality: 80 }).toFile(out);

    results.push(out);
  }

  return results;
}
