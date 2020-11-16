import { writeFile } from "fs/promises";
import metafiles from "../db/flathub/metafiles.js";
import { MONTHS } from "./config.js";


const countMap = metafiles.reduce((acc, it) => {
  const commitHistory = it.history ?? [];
  let thisMonthsCommit = null;

  for (const MONTH of MONTHS) {
    const found = commitHistory.find((it) => it.date.startsWith(MONTH) && it.finishArgs !== null);
    if (found) {
      thisMonthsCommit = found;
    }

    if (!thisMonthsCommit) {
      continue;
    }

    const { finishArgs: { socket, filesystem, device } } = thisMonthsCommit

    const supportsWayland = !!socket?.includes("wayland");
    const supportsX11 = !!socket?.includes("x11") || !!socket?.includes("fallback-x11");

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
        supportsWayland && !!socket?.includes("fallback-x11")
      ),
      ...increment(
        "wayland-and-x11",
        supportsWayland && !!socket?.includes("x11")
      ),
      ...increment("wayland-only", !supportsX11 && supportsWayland),
      ...increment("x11-only", supportsX11 && !supportsWayland),
      ...increment("gui", supportsX11 || supportsWayland),
      ...increment("no-gui", !supportsX11 && !supportsWayland),

      // audio
      ...increment("pulseaudio", !!socket?.includes("pulseaudio")),
      ...increment("no-pulseaudio", !socket?.includes("pulseaudio")),

      // device
      ...increment("device-other", !!device?.some(it => it !== "all")),
      ...increment("device-all", !!device?.includes("all")),
      ...increment("no-device", !device),

      // filesystem
      ...increment("filesystem-other", !!filesystem?.some(it => it !== "home" && it !== "host")),
      ...increment("filesystem-home", !!filesystem?.includes("home")),
      ...increment("filesystem-host", !!filesystem?.includes("host")),
      ...increment("no-filesystem", !filesystem),

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
