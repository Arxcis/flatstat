import { readFile, writeFile } from "fs/promises";

const metafiles = JSON.parse(await readFile("./data/flathub/metafiles.json"));

const changelog = metafiles
  .filter(meta => meta.history?.length)
  .reduce((acc, meta) => {

    const nonNullHistory = meta.history
      .filter(entry => entry.finishArgs !== null)

    const changelog = nonNullHistory
      .reverse()
      .map((current, index) => {
        if (index === 0) {
          return { appID: meta.appID, date: current.date, created: current.finishArgs, ext: meta.ext, displayURL: meta.displayURL }
        }
        const prev = nonNullHistory[index - 1]

        const deletions = prev.finishArgs
          .filter(arg => typeof arg === "string")
          .filter(prevArg => current.finishArgs
            .every(arg => arg !== prevArg))

        const additions = current.finishArgs
          .filter(arg => typeof arg === "string")
          .filter(currentArg => prev.finishArgs
            .every(arg => arg !== currentArg))

        let line = { date: current.date, appID: meta.appID, ext: meta.ext, }

        if (additions.length) {
          line = { ...line, additions }
        }

        if (deletions.length) {
          line = { ...line, deletions }
        }

        return { ...line, displayURL: meta.displayURL }
      })

    return [...acc, ...changelog];

  }, [])
  .sort((a, b) => b.date.localeCompare(a.date))
  .map(change => JSON.stringify(change))
  .join(",\n  ")

await writeFile("./data/flathub/changelog.json", `[\n  ${changelog}\n]\n`);
