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

export const WELL_KNOWN_PORTALS = [
  "ca.desrt.dconf",
  "org.a11y",
  "org.bluez", // bluetooth
  "org.freedesktop.Accounts",
  "org.freedesktop.Avahi",
  "org.freedesktop.ColorManager",
  "org.freedesktop.DBus",
  "org.freedesktop.FileManager1",
  "org.freedesktop.Flatpak",
  "org.freedesktop.GeoClue2",
  "org.freedesktop.NetworkManager",
  "org.freedesktop.Notifications",
  "org.freedesktop.PackageKit",
  "org.freedesktop.PolicyKit1",
  "org.freedesktop.PowerManagement",
  "org.freedesktop.RealtimeKit1",
  "org.freedesktop.ScreenSaver",
  "org.freedesktop.Telepathy",
  "org.freedesktop.Tracker1",
  "org.freedesktop.UDisk2",
  "org.freedesktop.UPower",
  "org.freedesktop.fwupd",
  "org.freedesktop.login1",
  "org.freedesktop.portal.Fcitx",
  "org.freedesktop.portal.FileChooser",
  "org.freedesktop.portal.Screenshot",
  "org.freedesktop.portal.Trash",
  "org.freedesktop.secrets",
  "org.freedesktop.timedate1",
  "org.freedesktop.tuhi1", // Wacom
  "org.gnome.OnlineAccounts",
  "org.gnome.Shell.Screencast",
  "org.gnome.Shell.Screenshot",
  "org.gtk.vfs",
  "org.mpris.MediaPlayer2"
]

const XDG_RUN = "xdg-run";
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

const isAllFile = (file) => file.startsWith("home") || file.startsWith("host");

const isNotUnknown = (file) =>
  isAllFile(file) ||
  file.startsWith(XDG_RUN) ||
  WELL_KNOWN_FILESYSTEM.some((wellKnown) => file.startsWith(wellKnown));

const isUnknownFile = (file) =>
  !isAllFile(file) &&
  !file.startsWith(XDG_RUN) &&
  WELL_KNOWN_FILESYSTEM.every((wellKnown) => !file.startsWith(wellKnown));

const isWellKnownFile = (file) =>
  WELL_KNOWN_FILESYSTEM.some((wellKnown) => file.startsWith(wellKnown));

const isWellKnownDevice = (device) =>
  WELL_KNOWN_DEVICE.some((wellKnown) => device === wellKnown);

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

export function sumPortals(portals) {
  return Object.values(WELL_KNOWN_PORTALS).reduce(
    (acc, portal) => acc + (portals?.[portal] ?? 0),
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
    ...increment(
      ACHIEVEMENTS.WaylandWithFallback,
      !!socket?.includes("wayland") && !!socket?.includes("fallback-x11")
    ),
    ...increment(
      ACHIEVEMENTS.NoFilesystemAll,
      !filesystem || filesystem.every((file) => !isAllFile(file))
    ),
    ...increment(
      ACHIEVEMENTS.NoFilesystemUnknown,
      !filesystem || filesystem.every((file) => isNotUnknown(file))
    ),
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
    ...increment(
      HOLES.FilesystemAll,
      !!filesystem?.some((file) => isAllFile(file))
    ),
    ...increment(
      HOLES.FilesystemUnknown,
      !!filesystem?.some((file) => isUnknownFile(file))
    ),
    ...increment(
      HOLES.FilesystemWellKnown,
      !!filesystem?.some((file) => isWellKnownFile(file))
    ),
    ...increment(
      HOLES.DeviceWellKnown,
      !!device?.some((device) => isWellKnownDevice(device))
    ),
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
    ...(finishArgs.systemTalkName ?? []),
  ]
    .filter((talk) => WELL_KNOWN_PORTALS.some((portal) => talk.startsWith(portal)))
    // de-duplicate
    .map((portal) => WELL_KNOWN_PORTALS.find((p) => portal.startsWith(p)))
    .reduce((acc, portal) => acc.add(portal), new Set());

  return {
    ...count,
    ...[...portals]
      .map((portal) => [portal, (count?.[portal] ?? 0) + 1])
      .reduce((acc, [portal, value]) => ({ ...acc, [portal]: value }), {}),
  };
}
