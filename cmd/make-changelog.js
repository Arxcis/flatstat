import { writeFile, unlink, appendFile, readFile } from "fs/promises";

const metafiles = JSON.parse(await readFile("./data/flathub/metafiles.json"));

const CHANGELOG_JSON = "./data/flathub/changelog.json";

const changelog = metafiles.filter(meta => (!!meta.history?.length) > 0).reduce((acc, meta) => {

  const nonNullHistory = meta.history
    .filter(entry => entry.finishArgs !== null)

  const changelog = nonNullHistory
    .reverse()
    .map((current, index) => {
      if (index === 0) {
        return { appID: meta.appID, date: current.date, deletions: [], additions: current.finishArgs, ext: meta.ext, displayURL: meta.displayURL }
      } else {
        const prev = nonNullHistory[index - 1]

        const deletions = prev.finishArgs.filter(prevArg => current.finishArgs.every(arg => arg !== prevArg)).filter(arg => typeof arg === "string")
        const additions = current.finishArgs.filter(currentArg => prev.finishArgs.every(arg => arg !== currentArg)).filter(arg => typeof arg === "string")

        return { appID: meta.appID, date: current.date, deletions: deletions, additions: additions, ext: meta.ext, displayURL: meta.displayURL }
      }
    }).filter(change => change);

  return [...acc, ...changelog];

}, []).sort((a, b) => b.date.localeCompare(a.date))



let changelogStr = `[\n  ${changelog.map(change => JSON.stringify(change)).join(",\n  ")}\n]\n`;
await writeFile(CHANGELOG_JSON, changelogStr);
