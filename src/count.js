import metadata from "./db/flathub/metadata.js";
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
  "2020-11",
];

const countMap = metadata.reduce((acc, it) => {
  const itHistory = it.history ?? [];
  let currentMonth = null;
  for (const key of MONTHS) {
    const found = itHistory.find((it) => it.date.startsWith(key));
    if (found) {
      currentMonth = found;
    }

    if (currentMonth) {
      const maybeValue = acc.get(key);

      const supportsX11 = currentMonth.x11; // || currentMonth.fallbackX11;

      acc.set(key, {
        x11: (maybeValue?.x11 ?? 0) + currentMonth.x11,
        ["fallback-x11"]:
          (maybeValue?.["fallback-x11"] ?? 0) + currentMonth.fallbackX11,
        wayland: (maybeValue?.wayland ?? 0) + currentMonth.wayland,

        // --device
        device: (maybeValue?.device ?? 0) + currentMonth.device,
        ["device-all"]:
          (maybeValue?.["device-all"] ?? 0) + currentMonth.deviceAll,
        ["no-device"]: (maybeValue?.["no-device"] ?? 0) + !currentMonth.device,

        // --filesystem
        filesystem: (maybeValue?.filesystem ?? 0) + currentMonth.filesystem,
        ["filesystem-home"]:
          (maybeValue?.["filesystem-home"] ?? 0) + currentMonth.filesystemHome,
        ["filesystem-host"]:
          (maybeValue?.["filesystem-host"] ?? 0) + currentMonth.filesystemHost,
        ["no-filesystem"]:
          (maybeValue?.["no-filesystem"] ?? 0) + !currentMonth.filesystem,

        ["only-wayland"]:
          (maybeValue?.["only-wayland"] ?? 0) +
          (currentMonth.wayland && !supportsX11),

        ["only-x11"]:
          (maybeValue?.["only-x11"] ?? 0) +
          (supportsX11 && !currentMonth.wayland),

        ["gui"]:
          (maybeValue?.["gui"] ?? 0) + (supportsX11 || currentMonth.wayland),

        ["no-gui"]:
          (maybeValue?.["no-gui"] ?? 0) +
          (!supportsX11 && !currentMonth.wayland),
      });
    }
  }

  return acc;
}, new Map());

const count = [...countMap.entries()]
  .map(([key, value]) => ({
    key,
    ...value,
  }))
  .sort((a, b) => a.key.localeCompare(b.key));

await writeFile(
  "./src/db/flathub/count.js",
  `export default ${JSON.stringify(count, null, 2)}`
);
