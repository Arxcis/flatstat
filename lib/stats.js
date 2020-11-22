export function sumAchievements(achievements) {
  return Object.values(ACHIEVEMENTS).reduce(
    (acc, achievement) => acc + (achievements[achievement] ?? 0),
    0
  );
}

export function sumHoles(holes) {
  return Object.values(HOLES).reduce(
    (acc, hole) => acc + (holes[hole] ?? 0),
    0
  );
}

export function sumTalkNames(talkNames) {
  return Object.values(talkNames).reduce(
    (acc, talkNameCount) => acc + talkNameCount,
    0
  );
}

export function sumFinishArgs(finishArgs) {
  return Object.values(finishArgs).reduce(
    (acc, argCount) => acc + argCount,
    0
  );
}


/**
 * @param {string[]} finishArgs from a metafile
 * @param {object} count counting object to be incremented
 */
export function incrementFinishArgs(finishArgs, count = {}) {
  return {
    ...count,
    ...finishArgs.map((arg) => [arg, (count[arg] ?? 0) + 1])
      .reduce((acc, [arg, value]) => ({ ...acc, [arg]: value }), {}),
  };
}

/**
 * @param {string[]} finishArgs from a metafile
 * @param {object} count counting object to be incremented
 */
export function incrementAchievementCount(finishArgs, count = {}) {
  function increment(key, value) {
    const newval = (count?.[key] ?? 0) + value;
    if (newval === 0) {
      return {};
    }

    return {
      [key]: newval,
    };
  }

  const [filesystem, socket, device] = parseArgs(["--filesystem", "--socket", "--device"], finishArgs);

  return {
    ...increment(
      ACHIEVEMENTS.WaylandWithFallback,
      socket.includes("wayland") && socket.includes("fallback-x11")
    ),
    ...increment(
      ACHIEVEMENTS.NoFilesystemAll,
      filesystem.length === 0 || filesystem.every((file) => !isAllFile(file))
    ),
    ...increment(
      ACHIEVEMENTS.NoFilesystemUnknown,
      filesystem.length === 0 || filesystem.every((file) => isNotUnknown(file))
    ),
    ...increment(ACHIEVEMENTS.NoFilesystem, filesystem.length === 0),
    ...increment(ACHIEVEMENTS.NoDeviceAll, device.includes("all")),
    ...increment(ACHIEVEMENTS.NoDevice, device.length === 0),
    ...increment(ACHIEVEMENTS.NoPulseaudio, !socket.includes("pulseaudio")),
  };
}

/**
 * @param {string[]} finishArgs from a metafile
 * @param {object} count counting object to be incremented
 */
export function incrementHoleCount(finishArgs, count = {}) {
  function increment(key, value) {
    const newval = (count?.[key] ?? 0) + value;
    if (newval === 0) {
      return {};
    }

    return {
      [key]: newval,
    };
  }

  const [filesystem, socket, device] = parseArgs(["--filesystem", "--socket", "--device"], finishArgs);

  return {
    ...increment(HOLES.X11, socket.includes("x11")),
    ...increment(
      HOLES.FilesystemAll,
      filesystem.some((file) => isAllFile(file))
    ),
    ...increment(
      HOLES.FilesystemUnknown,
      filesystem.some((file) => isUnknownFile(file))
    ),
    ...increment(
      HOLES.FilesystemWellKnown,
      filesystem.some((file) => isWellKnownFile(file))
    ),
    ...increment(
      HOLES.DeviceWellKnown,
      device.some((device) => isWellKnownDevice(device))
    ),
    ...increment(HOLES.DeviceAll, device.includes("all")),
    ...increment(HOLES.Pulseaudio, socket.includes("pulseaudio")),
  };
}

/**
 * @param {string[]} finishArgs from a metafile
 * @param {object} count counting object to be incremented
 */
export function incrementTalkNameCount(finishArgs, count = {}) {

  const [talkNames, systemTalkNames] = parseArgs(["--talk-name", "--system-talk-name"], finishArgs);
  const allTalkNames = [...talkNames, ...systemTalkNames]

  return {
    ...count,
    ...allTalkNames
      .map(talkName => [talkName, (count?.[talkName] ?? 0) + 1])
      .reduce((acc, [talkName, value]) => ({ ...acc, [talkName]: value }), {}),
  };
}

const isAllFile = (file) => file.startsWith("home") || file.startsWith("host");

const isNotUnknown = (file) =>
  isAllFile(file) ||
  file.startsWith(WELL_KNOWN_XDG_RUN) ||
  WELL_KNOWN_FILESYSTEM.some((wellKnown) => file.startsWith(wellKnown));

const isUnknownFile = (file) =>
  !isAllFile(file) &&
  !file.startsWith(WELL_KNOWN_XDG_RUN) &&
  WELL_KNOWN_FILESYSTEM.every((wellKnown) => !file.startsWith(wellKnown));

const isWellKnownFile = (file) =>
  WELL_KNOWN_FILESYSTEM.some((wellKnown) => file.startsWith(wellKnown));

const isWellKnownDevice = (device) =>
  WELL_KNOWN_DEVICE.some((wellKnown) => device === wellKnown);

/**
 * ## parseArgs
 *
 * @param {string[]} keys example: ["--filesystem", "--socket"]
 * @param {string[]} args example: ["--filesystem=home", "--socket=wayland", "--socket=x11"]
 *
 * @returns {string[]} parsed args example: [["home"], ["wayland", "x11"]]
 */
function parseArgs(keys, args) {
  return keys.map(key =>
    args
      .filter(arg => arg.startsWith?.(key))
      .filter(arg => arg)
      .map(arg => {
        const [key, ...value] = arg.split("=")
        return value.join("=")
      })
  )
}

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

const WELL_KNOWN_XDG_RUN = "xdg-run";

const WELL_KNOWN_FILESYSTEM = [
  "xdg-desktop",
  "xdg-documents",
  "xdg-download",
  "xdg-music",
  "xdg-pictures",
  "xdg-public-share",
  "xdg-templates",
  "xdg-videos",
  "xdg-config",
  "xdg-data",
  "xdg-cache",
];

const WELL_KNOWN_DEVICE = ["dri", "kvm", "shm"];
