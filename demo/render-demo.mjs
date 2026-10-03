import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "demo", "the-lantern-shift", "lantern-shift.mp4");
const work = path.join(tmpdir(), "contextcue-lantern");
mkdirSync(work, { recursive: true });

copyFileSync("C:/Windows/Fonts/arial.ttf", path.join(work, "arial.ttf"));
const scenes = [
  { seconds: 12, color: "0x0c121c", kicker: "PLATFORM THREE", body: "Maya\nPlatform three. Leo said not to be late." },
  { seconds: 14, color: "0x141c28", kicker: "THE COAT", body: "Jonah\nYou look soaked. I used to work the night shift here." },
  { seconds: 16, color: "0x1a1814", kicker: "THE DELAY", body: "Maya\nThat's Leo's train. He always takes the nine-forty." },
  { seconds: 14, color: "0x101820", kicker: "TRACK TWO", body: "Jonah\nThe service tunnel under track two is how someone leaves unseen." },
  { seconds: 18, color: "0x241610", kicker: "THE PHOTOGRAPH", body: "Jonah\nThat picture is us. I'm Leo. I changed my name." }
];

function draw(textFile, size, y) {
  return `drawtext=fontfile=arial.ttf:textfile=${path.basename(textFile)}:fontsize=${size}:fontcolor=0xf4f1ea:x=(w-text_w)/2:y=${y}:line_spacing=12`;
}

const segments = [];
scenes.forEach((scene, index) => {
  const kicker = path.join(work, `kicker-${index}.txt`);
  const body = path.join(work, `body-${index}.txt`);
  writeFileSync(kicker, scene.kicker);
  writeFileSync(body, scene.body);
  const segment = path.join(work, `seg-${index}.mp4`);
  const filter = [draw(kicker, 28, "h*0.62"), draw(body, 42, "h*0.70")].join(",");
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-f", "lavfi", "-i", `color=c=${scene.color}:s=1280x720:r=30:d=${scene.seconds}`,
      "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
      "-t", String(scene.seconds),
      "-vf", filter,
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-crf", "30",
      "-preset", "veryfast",
      "-c:a", "aac",
      "-shortest",
      path.basename(segment)
    ],
    { stdio: "inherit", cwd: work }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
  segments.push(segment);
});

const list = path.join(work, "list.txt");
writeFileSync(list, segments.map((file) => `file '${path.basename(file)}'`).join("\n"));
const concat = spawnSync(
  "ffmpeg",
  ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", out],
  { stdio: "inherit", cwd: work }
);
if (concat.status !== 0) process.exit(concat.status ?? 1);
console.log(out);
