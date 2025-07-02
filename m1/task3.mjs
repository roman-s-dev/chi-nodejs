import fs from "node:fs/promises";
import path from "node:path";

const [filePath, extension] = process.argv.slice(2);
if (!filePath || !extension) {
  console.log("You need to specify folder path and desired extension");
  console.log("Example of usage:\n\t node task3 /path/to/folder .txt");
}

const result = await findExtensions();
console.log(
  result
    .toSorted((a, b) => a.size - b.size)
    .map((v) => `${v.fileName} \t ${v.size}`)
    .join("\n")
);

async function findExtensions() {
  const rootPath = path.resolve(filePath);
  const files = await passFolder(rootPath);
  const filteredFiles = [];

  function extractFiles(filesToExtract) {
    filesToExtract.forEach((f) => {
      if (f.children.length > 0) return extractFiles(f.children);
      if (f.extension === ".txt") filteredFiles.push(f);
    });
  }

  extractFiles(files);
  return filteredFiles;
}

async function passFolder(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    const stats = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(folderPath, fileName);
        const stat = await fs.stat(filePath);
        return {
          fileName,
          size: stat.size,
          extension: path.extname(fileName),
          children: stat.isDirectory() ? await passFolder(filePath) : [],
        };
      })
    );
    return stats;
  } catch (err) {
    return [];
  }
}
