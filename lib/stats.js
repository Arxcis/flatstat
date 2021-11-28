import { HOLES } from "./holes.js"
import { ACHIEVEMENTS } from "./achievements.js"

export function sumAchievements(achievements) {
  return Object.values(achievements).reduce(
    (acc, achievement) => acc + achievement,
    0
  );
}

export function sumHoles(holes) {
  return Object.values(holes).reduce(
    (acc, hole) => acc + hole,
    0
  );
}

export function sumTalkNames(talkNames) {
  return Object.values(talkNames).reduce(
    (acc, talkName) => acc + talkName,
    0
  );
}

export function sumFinishArgs(finishArgs) {
  return Object.values(finishArgs).reduce(
    (acc, arg) => acc + arg,
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

  const [
    filesystem,
    socket,
    device,
    sessionTalkNames,
    sessionOwnNames,
    systemTalkNames,
    systemOwnNames,
    persists,
  ] = parseArgs([
    "--filesystem",
    "--socket",
    "--device",
    "--talk-name",
    "--own-name",
    "--system-talk-name",
    "--system-own-name",
    "--persist",
  ], finishArgs);

  return {
    // Display
    ...increment(
      ACHIEVEMENTS.WaylandWithFallback,
      socket.includes("wayland") && socket.includes("fallback-x11")
    ),
    ...increment(
      ACHIEVEMENTS.WaylandOnly,
      socket.includes("wayland") && !socket.includes("fallback-x11") && !socket.includes("x11")
    ),

    // Filesystem
    ...increment(
      ACHIEVEMENTS.NoFilesystemAll,
      filesystem.length === 0 || filesystem.every((file) => !isAllFile(file))
    ),
    ...increment(
      ACHIEVEMENTS.NoFilesystemUnknown,
      filesystem.length === 0 || filesystem.every((file) => isNotUnknown(file))
    ),
    ...increment(ACHIEVEMENTS.NoFilesystem, filesystem.length === 0),
    ...increment(ACHIEVEMENTS.Persist, persists.length > 0),

    // Device
    ...increment(ACHIEVEMENTS.NoDeviceAll, device.includes("all")),
    ...increment(ACHIEVEMENTS.NoDevice, device.length === 0),

    // Audio
    ...increment(ACHIEVEMENTS.NoAudio, hasNoAudio(socket, filesystem)),
    ...increment(ACHIEVEMENTS.PipewireOnly, hasPipewireOnly(socket, filesystem)),

    // Talk names
    ...increment(ACHIEVEMENTS.NoOwnName, sessionOwnNames.length === 0 && systemOwnNames.length === 0),
    ...increment(ACHIEVEMENTS.NoTalkName, sessionTalkNames.length === 0 && systemTalkNames.length === 0),
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

  const [
    filesystem,
    socket,
    device,
    sessionTalkNames,
    sessionOwnNames,
    systemTalkNames,
    systemOwnNames,
  ] = parseArgs([
    "--filesystem",
    "--socket",
    "--device",
    "--talk-name",
    "--own-name",
    "--system-talk-name",
    "--system-own-name",
  ], finishArgs);

  return {
    ...increment(HOLES.X11Only, socket.includes("x11") && !socket.includes("wayland")),
    ...increment(HOLES.X11AndWayland, socket.includes("x11") && socket.includes("wayland")),
    ...increment(
      HOLES.FilesystemHome,
      filesystem.some((file) => file.startsWith("home"))
    ),
    ...increment(
      HOLES.FilesystemHost,
      filesystem.some((file) => file.startsWith("host"))
    ),
    ...increment(
      HOLES.FilesystemHome,
      filesystem.some((file) => isAllFile(file))
    ),
    ...increment(
      HOLES.FilesystemOther,
      filesystem.some((file) => isUnknownFile(file))
    ),
    ...increment(
      HOLES.FilesystestemXDG,
      filesystem.some((file) => isXDGFile(file))
    ),
    ...increment(
      HOLES.DeviceDri,
      device.some((device) => device === "dri")
    ),
    ...increment(
      HOLES.DeviceShm,
      device.some((device) => device === "shm")
    ),
    ...increment(HOLES.DeviceAll, device.includes("all")),

    // Audio
    ...increment(HOLES.OnlyPulseaudio, hasOnlyPulseaudio(socket, filesystem)),
    ...increment(HOLES.PipewireAndPulseaudio, hasPipewireAndPulseaudio(socket, filesystem)),

    // talk names
    ...increment(HOLES.TalksSessionName, sessionTalkNames.length > 0),
    ...increment(HOLES.OwnsSessionName, sessionOwnNames.length > 0),
    ...increment(HOLES.TalksSystemName, systemTalkNames.length > 0),
    ...increment(HOLES.OwnsSystemName, systemOwnNames.length > 0),
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
  file.startsWith(XDG_RUN) ||
  FILESYSTEM_XDG.some((wellKnown) => file.startsWith(wellKnown));

const isUnknownFile = (file) =>
  !isAllFile(file) &&
  !file.startsWith(XDG_RUN) &&
  FILESYSTEM_XDG.every((wellKnown) => !file.startsWith(wellKnown));

const isXDGFile = (file) =>
  FILESYSTEM_XDG.some((wellKnown) => file.startsWith(wellKnown));

const hasNoAudio = (socket, filesystem) => !socket.includes("pulseaudio") && !filesystem.includes("xdg-run/pipewire-0");
const hasPipewireAndPulseaudio = (socket, filesystem) => socket.includes("pulseaudio") && filesystem.includes("xdg-run/pipewire-0");
const hasPipewireOnly = (socket, filesystem) => !socket.includes("pulseaudio") && filesystem.includes("xdg-run/pipewire-0");
const hasOnlyPulseaudio = (socket, filesystem) => socket.includes("pulseaudio") && !filesystem.includes("xdg-run/pipewire-0");

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

const XDG_RUN = "xdg-run";

const FILESYSTEM_XDG = [
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
