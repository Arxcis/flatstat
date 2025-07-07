import { readFile, writeFile, access, mkdir } from "fs/promises";
import { queryMetafileHistory } from "./query.js";

(async function main() {
  const CACHE_DIR = "./data/flathub/cache";
  const APPS_FILE = "./data/flathub/apps.json";
  const METAFILES_FILE = "./data/flathub/metafiles.json";

  const apps = JSON.parse(await readFile(APPS_FILE));

  // 1. Make cache dir if not exist
  await mkdir(CACHE_DIR, { recursive: true });

  // 2. Cache one file for each app
  const cachePaths = await makeMetafiles(CACHE_DIR, apps);

  // 3. Combine files into one single file
  await combineFiles(cachePaths, METAFILES_FILE);
})();

/** Cache one metafile for each app, and return paths to all cached files */
async function makeMetafiles(CACHE_DIR, apps) {
  let index = 0;

  const paths = [];

  for (const appID of apps) {
    index += 1;
    const PATH = `./${CACHE_DIR}/${index
      .toString()
      .padStart(4, "0")}.${appID}.json`;

    paths.push(PATH);

    // 1. Caching -> check if file already exist.
    const exists = await fileExists(PATH);
    if (exists) {
      console.info(
        `${index}: Cache hit! --> https://github.com/flathub/${appID}`
      );
      continue;
    }

    // 2. Query for the history of the metafile belonging to the appID
    const metafile = await queryMetafileHistory(appID);
    if (!metafile || metafile.history.length === 0) {
      console.info(
        `${index}: No history found for --> https://github.com/flathub/${appID}`
      );
      continue;
    }

    // 3. Log a line, to see progress when running the tool.
    console.info(`${index}: Status ${metafile.status}: ${metafile.displayURL}`);

    // 4. Serialize metafile-object to file
    await writeFile(PATH, JSON.stringify(metafile, null, 2));
  }

  return paths;
}

/** Make all metafiles/ into one giant metafiles.json */
async function combineFiles(paths, outpath) {
  let output = `[`;
  for (let i = 0; i < paths.length; ++i) {
    const path = paths[i];
    const json = await readFile(path);
    output += json;

    if (i < paths.length - 1) {
      output += ",";
    } else {
      output += "\n]";
    }
  }

  await writeFile(outpath, output);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
