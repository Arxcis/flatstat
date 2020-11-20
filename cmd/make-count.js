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

    // First get all finish args which happen more than once.
    const moreFinishArgs = Object
      .entries(value.finishArgs)
      .filter(([, value]) => value > 1);

    // See if any of the args used only once, startswith args which happen more than once
    const onceFinishArgs = Object
      .entries(value.finishArgs)
      .filter(([, value]) => value === 1);

    const sortedMoreFinishArgs = moreFinishArgs
      .sort(([, a], [, b]) => b - a)

    const sortedByArgLength = [...moreFinishArgs].sort(([arga], [argb]) => argb.length - arga.length)

    const combinedOnceFinishArgs = Object.entries(
      onceFinishArgs.reduce((acc, [onceArg]) => {
        const moreArg = sortedByArgLength.find(([moreArg]) => onceArg.startsWith(moreArg));
        if (moreArg) {
          return { ...acc, [`${moreArg[0]}&lt;other&gt;`]: (acc[`${moreArg[0]}&lt;other&gt;`] ?? 0) + 1 }
        } else {
          return acc
        }
      }, {})).filter(([, v]) => v > 1)

    const finishArgs = [
      ...sortedMoreFinishArgs,
      ...combinedOnceFinishArgs
    ]
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
