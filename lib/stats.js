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

export const PORTALS = [
  "org.freedesktop.Notifications",
  "org.freedesktop.secrets",
  "org.freedesktop.ScreenSaver",
  "org.freedesktop.FileManager1",
  "org.freedesktop.ColorManager",
  "org.freedesktop.UPower",
  "org.freedesktop.Flatpak",
  "org.freedesktop.NetworkManager",
  "org.freedesktop.PowerManagement",
  "org.freedesktop.GeoClue2",
  "org.freedesktop.login1",
  "org.freedesktop.timedate1",
  "org.freedesktop.PackageKit",
  "org.freedesktop.PolicyKit1",
  "org.freedesktop.Tracker1",
  "org.freedesktop.Telepathy",
  "org.freedesktop.Avahi",
  "org.freedesktop.Accounts",
  "org.freedesktop.UDisk2",
  "org.freedesktop.fwupd",
  "org.freedesktop.DBus",
  "org.freedesktop.portal.Fcitx",
  "org.freedesktop.portal.FileChooser",
  "org.freedesktop.portal.Trash",
];

const XDG_RUN = "xdg-run";
const WELL_KNOWN_FILESYSTEM = [
  "xdg-desktop",
  "xdg-documents",
  "xdg-download",
  "xdg-music",
  "xdg-pictures",
  "xdg-public-share",
  "xdg-config",
  "xdg-templates",
  "xdg-videos",
];

const WELL_KNOWN_DEVICE = [
  "dri",
  "kvm",
  "shm"
];

const isAllFile = file => file.startsWith("home") || file.startsWith("host");
const isNotUnknown = file =>  isAllFile(file) || file.startsWith(XDG_RUN) || WELL_KNOWN_FILESYSTEM.some(wellKnown => file.startsWith(wellKnown))
const isUnknownFile = file =>  !isAllFile(file) && !file.startsWith(XDG_RUN) && WELL_KNOWN_FILESYSTEM.every(wellKnown => !file.startsWith(wellKnown))
const isWellKnownFile = file => WELL_KNOWN_FILESYSTEM.some(wellKnown => file.startsWith(wellKnown))
const isWellKnownDevice = device => WELL_KNOWN_DEVICE.some(wellKnown => device === wellKnown)


export function sumAchievements(item) {
  return Object.values(ACHIEVEMENTS).reduce(
    (acc, achievement) => acc + (item[achievement] ?? 0),
    0
  );
}

export function sumHoles(item) {
  return Object.values(HOLES).reduce(
    (acc, hole) => acc + (item[hole] ?? 0),
    0
  );
}

export function sumPortals(item) {
  return Object.values(PORTALS).reduce(
    (acc, portal) => acc + (item.portals[portal] ?? 0),
    0
  );
}

/**
 * @param {{socket: string[], filesytem: string[], device: string[]}} finishArgs from a metafile-object
 * @param {object} count an existing counting object, which should be added to
 */
export function countAchievements(finishArgs, count = {}) {
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
    ...increment(ACHIEVEMENTS.WaylandWithFallback, !!socket?.includes("wayland") && !!socket?.includes("fallback-x11")),
    ...increment(ACHIEVEMENTS.NoFilesystemAll, !filesystem || filesystem.every(file => !isAllFile(file))),
    ...increment(ACHIEVEMENTS.NoFilesystemUnknown, !filesystem || filesystem.every(file => isNotUnknown(file))),
    ...increment(ACHIEVEMENTS.NoFilesystem, !filesystem),
    ...increment(ACHIEVEMENTS.NoDeviceAll, !device?.includes("all")),
    ...increment(ACHIEVEMENTS.NoDevice, !device),
    ...increment(ACHIEVEMENTS.NoPulseaudio, !socket?.includes("pulseaudio")),
  };
}


/**
 * @param {{socket: string[], filesytem: string[], device: string[]}} finishArgs from a metafile-object
 * @param {object} count an existing counting object, which should be added to
 */
export function countHoles(finishArgs, count = {}) {
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
    ...increment(HOLES.FilesystemAll, !!filesystem?.some(file => isAllFile(file))),
    ...increment(HOLES.FilesystemUnknown, !!filesystem?.some(file => isUnknownFile(file))),
    ...increment(HOLES.FilesystemWellKnown, !!filesystem?.some(file => isWellKnownFile(file))),
    ...increment(HOLES.DeviceWellKnown, !!device?.some(device => isWellKnownDevice(device))),
    ...increment(HOLES.DeviceAll, !!device?.includes("all")),
    ...increment(HOLES.Pulseaudio, !!socket?.includes("pulseaudio")),
  };
}

/**
 * @param {{talkName: string[], systemTalkName: string[]}} finishArgs from a metafile-object
 * @param {object} count an existing counting object, which should be added to
 */
export function countPortals(finishArgs, count = {}) {
  let portals = [
    ...(finishArgs.talkName ?? []), 
    ...finishArgs.systemTalkName ?? []
  ].filter(talk => PORTALS.some(portal => talk.startsWith(portal)))
    // de-duplicate
    .map(portal =>  PORTALS.find(p => portal.startsWith(p)))
    .reduce((acc, portal) => acc.add(portal), new Set())

  return {
    ...count,
    ...[...portals]
      .map(portal => [portal, (count?.[portal] ?? 0) + 1])
      .reduce((acc, [portal, value]) => ({...acc, [portal]: value }), {})
  };
}
