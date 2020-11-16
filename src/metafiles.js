import { appendFile, unlink } from "fs/promises";
import repos from "../db/flathub/repos.js";
import { queryMetafileHistory } from "./query.js"
let index = 0;

const MEATFILES_JSON = "./db/flathub/metafiles.js";

await unlink(MEATFILES_JSON);
await appendFile(MEATFILES_JSON, "export default [");
await makeMetafiles(repos);
await appendFile(MEATFILES_JSON, "]");

async function makeMetafiles(repos) {
  for (const { name: appID } of repos) {
    index += 1;

    // 1. ignore names which does not include atleast a period '.'
    //
    // Example valid name: 'com.github.Flacon' or 'org.robocode.Robocode
    // Exampe invalid name: 'flathub-tools' or 'blog'
    if (!appID.includes(".")) {
      console.log(
        `${index}: https://github.com/flathub/${appID} -------> Ignoring`
      );
      continue;
    }

    // 2. Query for the history of the metafile belonging to the appID
    const metafile = await queryMetafileHistory(appID)
    if (!metafile) {
      // no history found
      console.log(
        `${index}: https://github.com/flathub/${appID} -------> No history found`
      );
      continue;
    }

    // 3. Log a line, to see progress when running the tool.
    console.log(
      `${index}: https://github.com/flathub/${metafile.appID}/blob/${metafile.branch}/${metafile.appID}.${metafile.ext} ${metafile.stargazerCount}`
    );

    // 4. Append metafile-object to file
    await appendFile(MEATFILES_JSON, `${JSON.stringify(metafile, null, 2)},`);
  }
}
