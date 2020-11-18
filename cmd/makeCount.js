import { writeFile, readFile } from "fs/promises";
import { MONTHS } from "./config.js";
import { countAchievements, countHoles, countPortals } from "../lib/stats.js";

const metafiles = JSON.parse(await readFile("./data/flathub/metafiles.json"));

const COUNT_JSON = "./data/flathub/count.json";

const countMap = metafiles.reduce((acc, it) => {
  const commitHistory = it.history ?? [];
  let thisMonthsCommit = null;

  for (const MONTH of MONTHS) {
    const found = commitHistory.find(
      (it) => it.date.startsWith(MONTH) && it.finishArgs !== null
    );
    if (found) {
      thisMonthsCommit = found;
    }

    if (!thisMonthsCommit) {
      continue;
    }

    const { finishArgs } = thisMonthsCommit;

    const monthCount = acc.get(MONTH);
    function increment(key, value) {
      return {
        [key]: (monthCount?.[key] ?? 0) + value,
      };
    }

    acc.set(MONTH, {
      ...increment("apps", 1),
      ...increment("json", it.ext === "json"),
      ...increment("yaml", it.ext === "yaml"),
      ...increment("yml", it.ext === "yml"),

      ...countAchievements(finishArgs, monthCount),
      ...countHoles(finishArgs, monthCount),
      portals: countPortals(finishArgs, monthCount?.portals)
    });
  }

  return acc;
}, new Map());

const count = [...countMap.entries()]
  .map(([key, value]) => ({
    month: key,
    ...value,
  }))
  .sort((a, b) => a.month.localeCompare(b.month));

await writeFile(COUNT_JSON, JSON.stringify(count, null, 2));
