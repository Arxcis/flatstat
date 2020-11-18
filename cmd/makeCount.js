import { writeFile, readFile } from "fs/promises";
import { MONTHS } from "./config.js";
import { incrementAchievementCount, incrementHoleCount, incrementPortalCount, incrementFinishArgs } from "../lib/stats.js";

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

      ...incrementAchievementCount(finishArgs, monthCount),
      ...incrementHoleCount(finishArgs, monthCount),
      portals: incrementPortalCount(finishArgs, monthCount?.portals),
      finishArgs: incrementFinishArgs(finishArgs, monthCount?.finishArgs)
    });
  }


  return acc;
}, new Map());

const count = [...countMap.entries()]
  .map(([key, value]) => {

    // Sort and filter away things that only happens once
    const finishArgs = Object
      .entries(value.finishArgs)
      .filter(([, value]) => value > 1)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const portals = Object
      .entries(value.portals)
      .filter(([, value]) => value > 1)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    return ({
      month: key,
      ...value,
      finishArgs,
      portals,
    })
  })
  .sort((a, b) => a.month.localeCompare(b.month));

await writeFile(COUNT_JSON, JSON.stringify(count, null, 2));
