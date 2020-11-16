import { writeFile } from "fs/promises";
import metafiles from "../db/flathub/metafiles.js";
import { MONTHS, ACHIEVEMENTS, HOLES } from "./config.js";

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

    const {
      finishArgs: { socket, filesystem, device },
    } = thisMonthsCommit;

    const supportsWayland = !!socket?.includes("wayland");
    const supportsX11 =
      !!socket?.includes("x11") || !!socket?.includes("fallback-x11");

    const maybeMonth = acc.get(MONTH);

    function increment(key, value) {
      return {
        [key]: (maybeMonth?.[key] ?? 0) + value,
      };
    }

    acc.set(MONTH, {
      ...(maybeMonth ?? {}),
      ...increment("apps", 1),
      ...increment("json", it.ext === "json"),
      ...increment("yaml", it.ext === "yaml"),
      ...increment("yml", it.ext === "yml"),

      // Achievements
      ...increment(
        ACHIEVEMENTS.WaylandWithFallback,
        supportsWayland && !!socket?.includes("fallback-x11")
      ),
      ...increment(
        ACHIEVEMENTS.NoFilesystemAll,
        !filesystem?.includes("home") && !!filesystem?.includes("host")
      ),
      ...increment(ACHIEVEMENTS.NoFilesystemAtAll, !filesystem),
      ...increment(ACHIEVEMENTS.NoDeviceAll, !device?.includes("all")),
      ...increment(ACHIEVEMENTS.NoDeviceAtAll, !device),
      ...increment(ACHIEVEMENTS.NoAudioAll, !socket?.includes("pulseaudio")),

      // Holes
      ...increment(HOLES.X11, supportsX11),
      ...increment(HOLES.FilesystemSome, !!filesystem?.length > 0),
      ...increment(
        HOLES.FilesystemAll,
        !!filesystem?.includes("home") || !!filesystem?.includes("host")
      ),
      ...increment(HOLES.DeviceSome, !!device?.length > 0),
      ...increment(HOLES.DeviceAll, !!device?.includes("all")),
      ...increment(HOLES.AudioAll, !!socket?.includes("pulseaudio")),
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
