export const ACHIEVEMENTS = {
  WaylandWithFallback: "--wayland-with-fallback",
  NoFilesystemAll: "--no-filesystem-all",
  NoFilesystemUnknown: "--no-filesystem-unknown",
  NoFilesystem: "--no-filesystem",
  NoDeviceAll: "--no-device-all",
  NoDevice: "--no-device",
  NoPulseaudio: "--no-pulseaudio",
};

export const HOLES = {
  X11: "--x11",
  FilesystemAll: "--filesystem-all",
  FilesystemUnknown: "--filesystem-unknown",
  FilesystemWellKnown: "--filesystem-well-known",
  DeviceAll: "--device-all",
  DeviceWellKnown: "--device-well-known",
  Pulseaudio: "--pulseaudio",
};

const XDG_RUN = "xdg-run";
const WELL_KNOWN_FILESYSTEM = [
  "xdg-download",
  "xdg-config",
  "xdg-music",
  "xdg-pictures",
  "xdg-documents",
  "xdg-videos",
  "xdg-desktop",
];

const WELL_KNOWN_DEVICE = [
  "dri",
  "kvm",
  "shm"
];

const isNotUnknown = file => file === "home" || file === "host" || file.startsWith(XDG_RUN) || WELL_KNOWN_FILESYSTEM.some(wellKnown => file.startsWith(wellKnown))
const isUnknownFile = file => file !== "home" && file !== "host" && !file.startsWith(XDG_RUN) && WELL_KNOWN_FILESYSTEM.every(wellKnown => !file.startsWith(wellKnown))
const isWellKnownFile = file => WELL_KNOWN_FILESYSTEM.some(wellKnown => file.startsWith(wellKnown))
const isWellKnownDevice = device => WELL_KNOWN_DEVICE.some(wellKnown => device === wellKnown)


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


  return {
    ...increment(
      ACHIEVEMENTS.WaylandWithFallback,
      !!socket?.includes("wayland") && !!socket?.includes("fallback-x11")
    ),
    ...increment(
      ACHIEVEMENTS.NoFilesystemAll,
      !filesystem?.includes("home") && !filesystem?.includes("host")
    ),
    ...increment(ACHIEVEMENTS.NoFilesystemUnknown, !filesystem || filesystem.every(file => isNotUnknown(file))),
    ...increment(ACHIEVEMENTS.NoFilesystem, !filesystem),
    ...increment(ACHIEVEMENTS.NoDeviceAll, !device?.includes("all")),
    ...increment(ACHIEVEMENTS.NoDevice, !device),
    ...increment(ACHIEVEMENTS.NoPulseaudio, !socket?.includes("pulseaudio")),
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

  return {
    ...increment(HOLES.X11, !!socket?.includes("x11")),
    ...increment(
      HOLES.FilesystemAll,
      !!filesystem && !!(filesystem.includes("home") || filesystem.includes("host"))
    ),
    ...increment(HOLES.FilesystemUnknown, !!filesystem?.some(file => isUnknownFile(file))),
    ...increment(HOLES.FilesystemWellKnown, !!filesystem?.some(file => isWellKnownFile(file))),
    ...increment(HOLES.DeviceWellKnown, !!device?.some(device => isWellKnownDevice(device))),
    ...increment(HOLES.DeviceAll, !!device?.includes("all")),
    ...increment(HOLES.Pulseaudio, !!socket?.includes("pulseaudio")),
  };
}
