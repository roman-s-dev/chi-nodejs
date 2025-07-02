import fsp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { getRandomRow } from "./utils.mjs";

const [LIMIT] = process.argv.slice(2);
if (!LIMIT) {
  console.log("You need to specify limit in lines and limit in size");
  console.log("Example of usage:\n\t node index.mjs 10000 30");
  process.exit(0);
}
const [LINES_LIMIT, SIZE_LIMIT_MB] = [
  LIMIT.endsWith("MB") ? null : LIMIT,
  LIMIT.endsWith("MB") ? +LIMIT.slice(0, LIMIT.length - 2).trim() : null,
];
const SIZE_LIMIT_B =
  SIZE_LIMIT_MB === null ? null : SIZE_LIMIT_MB * 1024 * 1024;

const RESULT_PATH = "./result.csv";

const HEADER = [
  "#",
  "First Name",
  "Last Name",
  "Company",
  "Address",
  "City",
  "Country",
  "ZIP",
  "Phone",
  "Email",
  "Web Link",
];
try {
  await fsp.access(path.resolve(RESULT_PATH));
  await fsp.writeFile(path.resolve(RESULT_PATH), "");
} catch (err) {
  await fsp.appendFile(path.resolve(RESULT_PATH), HEADER.join(","));
}

const writeStream = fs.createWriteStream(RESULT_PATH);
let line = 1;
let currentSizeBytes = 0;
let chunk = "";
let row = "";
let rowSizeBytes = 0;

function logCurrentState() {
  console.log("line\t", line);
  console.log("Size\t", (currentSizeBytes / 1024 / 1024).toFixed(2) + "MB");
  console.log(
    "Memory\t",
    (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + "MB"
  );
}
logCurrentState();
const interval = setInterval(() => logCurrentState(), 1000);

async function tick() {
  row = getRandomRow(line).join(",") + "\n";
  rowSizeBytes = Buffer.byteLength(row, "utf8");
  if (
    isSizeLimitsMet(rowSizeBytes + currentSizeBytes) ||
    isLinesLimitMet(line)
  ) {
    clearInterval(interval);
    await writeData(chunk);
    writeStream.close();
    logCurrentState();
    return;
  }

  chunk += row;
  if (chunk.length > 4e3) {
    await writeData(chunk);
    chunk = "";
  }

  currentSizeBytes += rowSizeBytes;
  line++;
  process.nextTick(() => tick());
}
tick();

function isSizeLimitsMet(size) {
  if (SIZE_LIMIT_B === null) return false;
  return size > SIZE_LIMIT_B;
}

function isLinesLimitMet(linesCount) {
  if (LINES_LIMIT === null) return false;
  return linesCount > LINES_LIMIT;
}

function writeData(data) {
  return new Promise((resolve) => {
    if (!writeStream.write(data, resolve)) {
      writeStream.once("drain", resolve);
    }
  });
}
