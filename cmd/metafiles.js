import { appendFile, unlink } from "fs/promises";
import apps from "../db/flathub/repos.js";
import { queryMetafileHistory } from "./query.js";

const MEATFILES_JSON = "./db/flathub/metafiles.js";

await unlink(MEATFILES_JSON);
await appendFile(MEATFILES_JSON, "export default [");
await makeMetafiles(apps);
await appendFile(MEATFILES_JSON, "]");

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
    await appendFile(MEATFILES_JSON, `${JSON.stringify(metafile, null, 2)},`);
  }
}
