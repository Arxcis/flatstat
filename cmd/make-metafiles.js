import { appendFile, unlink, readFile } from "fs/promises";
import { queryMetafileHistory } from "./query.js";

const apps = JSON.parse(await readFile("./data/flathub/apps.json"));

const METAFILES_JSON = "./data/flathub/metafiles.json";

await unlink(METAFILES_JSON)
await appendFile(METAFILES_JSON, "[");
await makeMetafiles(apps);
await appendFile(METAFILES_JSON, "]");

async function makeMetafiles(apps) {
  let index = 0;

  for (const appID of apps) {
    index += 1;

    // 2. Query for the history of the metafile belonging to the appID
    const metafile = await queryMetafileHistory(appID);
    if (!metafile) {
      // no history found
      console.log(
        `${index}: https://github.com/flathub/${appID} -------> No history found`
      );
      continue;
    }

    // 3. Log a line, to see progress when running the tool.
    console.log(`${index}: Status ${metafile.status}: ${metafile.displayURL}`);

    // 4. Append metafile-object to file
    const notTheLastApp = index !== apps.length
    await appendFile(METAFILES_JSON, `${JSON.stringify(metafile, null, 2)}${notTheLastApp ? "," : ""}`);
  }
}
