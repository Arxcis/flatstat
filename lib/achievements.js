export const ACHIEVEMENTS = {
  WaylandWithFallback: "--wayland-with-fallback",
  NoFilesystemAll: "--no-filesystem-all",
  NoFilesystemUnknown: "--no-filesystem-unknown",
  NoFilesystem: "--no-filesystem",
  NoDeviceAll: "--no-device-all",
  NoDevice: "--no-device",
  NoPulseaudio: "--no-pulseaudio",
  NoTalkName: "--no-talk-name",
  NoOwnName: "--no-own-name"
};
  
export const ACHIEVEMENT_DESCRIPTIONS = [
  { id: ACHIEVEMENTS.WaylandWithFallback, description: "Your app supports Wayland. Wayland supports isolation between apps. If the user is in a Wayland session, your app does not have access to x11. At the same time your app remains backwards-compatible with x11-users, giving x11-users access to the Flatpak ecosystem." },

  { id: ACHIEVEMENTS.NoFilesystemAll, description: "Your app does not ask for blanket access to an entire filesystem, like --filesystem=home or --filesystem=host." },
  
  { id: ACHIEVEMENTS.NoFilesystemUnknown, description: `Your app does not ask for access to any unknown files or directories - outside of the "well-known directories" like xdg-download, xdg-music, etc.` },

  { id: ACHIEVEMENTS.NoFilesystem, description: "Your app does not ask for blanket access to any files or directories, leaving the user in full control of which files the app is given access to. Your app is likely using the org.freedsektop.portal.FileChooser-portal." },

  { id: ACHIEVEMENTS.NoDeviceAll, description: "Your app does not ask for blanket access to all of the users connected devices, aka --device=all." },

  { id: ACHIEVEMENTS.NoDevice, description: "Your app does not ask for blanket access to any connected devices, leaving the user in full control of which devices the app is given access to. Your app is likely using portals instead." },

  { id: ACHIEVEMENTS.NoPulseaudio, description: "Your app does not ask for blanket access to the users audio." },

  { id: ACHIEVEMENTS.NoTalkName, description: "Your app does not talk to any names on the system- or session-bus - not using any --talk-name=NAME or --system-talk-name=NAME. Your app is likely using portals instead." },

  { id: ACHIEVEMENTS.NoOwnName, description: "Your app does not own any names on the system- or session-bus - not using any --own-name=NAME or --system-own-name. Your app is likely using portals instead." },
]
