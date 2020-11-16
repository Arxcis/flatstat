import metadata from "../db/flathub/metadata.js";
import { writeFile } from "fs/promises";

const MONTHS = [
  "2018-01",
  "2018-02",
  "2018-03",
  "2018-04",
  "2018-05",
  "2018-06",
  "2018-07",
  "2018-08",
  "2018-09",
  "2018-10",
  "2018-11",
  "2018-12",
  "2019-01",
  "2019-02",
  "2019-03",
  "2019-04",
  "2019-05",
  "2019-06",
  "2019-07",
  "2019-08",
  "2019-09",
  "2019-10",
  "2019-11",
  "2019-12",
  "2020-01",
  "2020-02",
  "2020-03",
  "2020-04",
  "2020-05",
  "2020-06",
  "2020-07",
  "2020-08",
  "2020-09",
  "2020-10",
  // "2020-11", Ignore current month
];

const countMap = metadata.reduce((acc, it) => {
  const itHistory = it.history ?? [];
  let lastCommitThisMonth = null;

  for (const MONTH of MONTHS) {
    const found = itHistory.find((it) => it.date.startsWith(MONTH));
    if (found) {
      lastCommitThisMonth = found;
    }

    if (!lastCommitThisMonth) {
      continue;
    }

    const supportsWayland = lastCommitThisMonth.wayland;
    const supportsX11 =
      lastCommitThisMonth.x11 || lastCommitThisMonth.fallbackX11;

    const maybeMonth = acc.get(MONTH);

    function increment(key, value) {
      return {
        [key]: (maybeMonth?.[key] ?? 0) + value,
      };
    }

    acc.set(MONTH, {
      ...(maybeMonth ?? {}),

      // display
      ...increment(
        "wayland-and-fallback-x11",
        supportsWayland && lastCommitThisMonth.fallbackX11
      ),
      ...increment(
        "wayland-and-x11",
        supportsWayland && lastCommitThisMonth.x11
      ),
      ...increment("only-wayland", !supportsX11 && supportsWayland),
      ...increment("only-x11", supportsX11 && !supportsWayland),
      ...increment("gui", supportsX11 || supportsWayland),
      ...increment("no-gui", !supportsX11 && !supportsWayland),

      // audio
      ...increment("pulseaudio", lastCommitThisMonth.pulseaudio),
      ...increment("no-pulseaudio", !lastCommitThisMonth.pulseaudio),

      // device
      ...increment("device", lastCommitThisMonth.device),
      ...increment(
        "device-other",
        lastCommitThisMonth.device && !lastCommitThisMonth.deviceAll
      ),
      ...increment("device-all", lastCommitThisMonth.deviceAll),
      ...increment("no-device", !lastCommitThisMonth.device),

      // filesystem
      ...increment("filesystem", lastCommitThisMonth.filesystem),
      ...increment(
        "filesystem-other",
        lastCommitThisMonth.filesystem &&
          !lastCommitThisMonth.filesystemHome &&
          !lastCommitThisMonth.filesystemHost
      ),
      ...increment("filesystem-home", lastCommitThisMonth.filesystemHome),
      ...increment("filesystem-host", lastCommitThisMonth.filesystemHost),
      ...increment("no-filesystem", !lastCommitThisMonth.filesystem),

      // metafile
      ...increment(it.ext, 1),
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

await writeFile(
  "./db/flathub/count.js",
  `export default ${JSON.stringify(count, null, 2)}`
);
