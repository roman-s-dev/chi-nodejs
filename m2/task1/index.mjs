import http from "node:http";
import fsp from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const dirname = path.dirname(
  decodeURIComponent(new URL(import.meta.url).pathname)
);
const logoPath = path.join(dirname, "logo.png");

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, "OK", { "Content-Type": "text/html" });
    const html = await getIndexHtml();
    res.end(html);
  } else if (req.method === "POST" && req.url === "/upload") {
    const transformer = sharp()
      .resize(process.env.RESULT_IMG_WIDTH, process.env.RESULT_IMG_HEIGHT)
      .composite([
        { input: logoPath, gravity: "southeast" },
        { input: getTextSvgBuffer("Bruh"), gravity: "southwest" },
      ])
      .png();
    req.pipe(transformer).pipe(res);
    res.writeHead(200, { "Content-Type": "image/png" });
  } else if (true) {
    res.writeHead(404);
    res.end("Not found!");
  }
});
server.listen(process.env.PORT, "127.0.0.1", () => {
  console.log("Server is running!");
});

async function getIndexHtml() {
  return await fsp.readFile(path.resolve("index.html"), "utf8");
}

function getTextSvgBuffer(text) {
  return Buffer.from(`
  <svg width="100" height="50">
    <style>
      .title { fill: #a22; font-size: 32px; font-weight: 700; opacity: 0.5; font-family: sans-serif; }
    </style>
    <text x="10" y="40" class="title">${text}</text>
  </svg>
`);
}
