import { writeFile } from "fs/promises";
import metafiles from "../db/flathub/metafiles.js";
import { MONTHS } from "./config.js";


const countMap = metafiles.reduce((acc, it) => {
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
