import { writeFile, readFile } from "fs/promises";
import { MONTHS } from "./config.js";
import { incrementAchievementCount, incrementHoleCount, incrementTalkNameCount, incrementFinishArgs } from "../lib/stats.js";

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
      talkNames: incrementTalkNameCount(finishArgs, monthCount?.talkNames),
      finishArgs: incrementFinishArgs(finishArgs, monthCount?.finishArgs)
    });
  }


  return acc;
}, new Map());

const count = [...countMap.entries()]
  .map(([key, value]) => {

    return ({
      month: key,
      ...value,
      talkNames: trimAndSortCount(value.talkNames),
      finishArgs: trimAndSortCount(value.finishArgs),
    })
  })
  .sort((a, b) => a.month.localeCompare(b.month));

await writeFile(COUNT_JSON, JSON.stringify(count, null, 2));

function trimAndSortCount(count) {

  const countsWithMoreThanOne = Object
    .entries(count)
    .filter(([, value]) => value > 1);

  const countsWithJustOnce = Object
    .entries(count)
    .filter(([, value]) => value === 1);

  const sortedCountsWithMoreThanOne = countsWithMoreThanOne
    .sort(([, a], [, b]) => b - a)

  const sortedByArgLength = [...countsWithMoreThanOne].sort(([arga], [argb]) => argb.length - arga.length)

  const combinedCountsWithJustOnce = Object.entries(
    countsWithJustOnce.reduce((acc, [onceArg]) => {
      const moreArg = sortedByArgLength.find(([moreArg]) => onceArg.startsWith(moreArg));
      if (moreArg) {
        return { ...acc, [`${moreArg[0]}&lt;SOMETHING&gt;`]: (acc[`${moreArg[0]}&lt;SOMETHING&gt;`] ?? 0) + 1 }
      } else {
        return acc
      }
    }, {})).filter(([, v]) => v > 1)

  const trimmedAndSortedCounts = [
    ...sortedCountsWithMoreThanOne,
    ...combinedCountsWithJustOnce
  ]
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return trimmedAndSortedCounts;
}
