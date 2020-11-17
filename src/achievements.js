import { ACHIEVEMENTS, HOLES } from "./config.js";

export function countAchievements(item) {
  return Object.values(ACHIEVEMENTS).reduce(
    (acc, value) => acc + (item[value] ?? 0),
    0
  );
}

export function countHoles(item) {
  return Object.values(HOLES).reduce(
    (acc, value) => acc + (item[value] ?? 0),
    0
  );
}

export function addAchievements(finishArgs, count = {}) {
  function increment(key, value) {
    const newval = (count?.[key] ?? 0) + value;
    if (newval === 0) {
      return {};
    }

    return {
      [key]: newval,
    };
  }

  const { socket, filesystem, device } = finishArgs;
  const supportsWayland = !!socket?.includes("wayland");

  return {
    ...increment(
      ACHIEVEMENTS.WaylandWithFallback,
      supportsWayland && !!socket?.includes("fallback-x11")
    ),
    ...increment(
      ACHIEVEMENTS.NoFilesystemAll,
      !filesystem?.includes("home") && !filesystem?.includes("host")
    ),
    ...increment(ACHIEVEMENTS.NoFilesystemAtAll, !filesystem),
    ...increment(ACHIEVEMENTS.NoDeviceAll, !device?.includes("all")),
    ...increment(ACHIEVEMENTS.NoDeviceAtAll, !device),
    ...increment(ACHIEVEMENTS.NoAudioAll, !socket?.includes("pulseaudio")),
  };
}

export function addHoles(finishArgs, count = {}) {
  function increment(key, value) {
    const newval = (count?.[key] ?? 0) + value;
    if (newval === 0) {
      return {};
    }

    return {
      [key]: newval,
    };
  }

  const { socket, filesystem, device } = finishArgs;
  const supportsX11 =
    !!socket?.includes("x11") || !!socket?.includes("fallback-x11");

  return {
    ...increment(HOLES.X11, supportsX11),
    ...increment(HOLES.FilesystemSome, !!filesystem?.length > 0),
    ...increment(
      HOLES.FilesystemAll,
      !!filesystem?.includes("home") || !!filesystem?.includes("host")
    ),
    ...increment(HOLES.DeviceSome, !!device?.length > 0),
    ...increment(HOLES.DeviceAll, !!device?.includes("all")),
    ...increment(HOLES.AudioAll, !!socket?.includes("pulseaudio")),
  };
}
