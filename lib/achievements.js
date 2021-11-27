export const ACHIEVEMENTS = {
  WaylandOnly: "--wayland-only",
  WaylandWithFallback: "--wayland-with-fallback",
  NoFilesystemAll: "--no-filesystem-all",
  NoFilesystemUnknown: "--no-filesystem-unknown",
  NoFilesystem: "--no-filesystem",
  NoDeviceAll: "--no-device-all",
  NoDevice: "--no-device",
  NoAudio: "--no-audio",
  NoTalkName: "--no-talk-name",
  NoOwnName: "--no-own-name",
  Persist: "--persist",
  PipewireOnly: "--pipewire-only"
};

export const ACHIEVEMENT_DESCRIPTIONS = [
  { id: ACHIEVEMENTS.WaylandOnly, description: "Your app supports Wayland. Wayland supports isolation between apps." },

  { id: ACHIEVEMENTS.WaylandWithFallback, description: "Your app supports Wayland. Wayland supports isolation between apps. If the user is in a Wayland session, your app does not have access to x11. At the same time your app remains backwards-compatible with x11." },

  { id: ACHIEVEMENTS.NoFilesystemAll, description: "Your app does not ask for blanket access to an entire filesystem, like --filesystem=home or --filesystem=host." },

  { id: ACHIEVEMENTS.NoFilesystemUnknown, description: `Your app does not ask for access to any unknown files or directories - outside of the "well-known directories" like xdg-download, xdg-music, etc.` },

  { id: ACHIEVEMENTS.NoFilesystem, description: "Your app does not ask for blanket access to any files or directories. Files and directories may still be accessed through the org.freedsektop.portal.FileChooser-portal." },

  { id: ACHIEVEMENTS.NoDeviceAll, description: "Your app does not ask for blanket access to all devices with --device=all." },

  { id: ACHIEVEMENTS.NoDevice, description: "Your app does not ask for blanket access to any device." },

  { id: ACHIEVEMENTS.NoAudio, description: "Your app does not ask for blanket access to audio." },

  { id: ACHIEVEMENTS.NoTalkName, description: "Your app does not talk to any names on the system- or session-bus - not using any --talk-name=NAME or --system-talk-name=NAME." },

  { id: ACHIEVEMENTS.NoOwnName, description: "Your app does not own any names on the system- or session-bus - not using any --own-name=NAME or --system-own-name=NAME." },

  { id: ACHIEVEMENTS.Persist, description: "Your app is using --persist=FILENAME to persist data in the app-specific folder located here ~/.var/apps/APP_ID/, instead of polluting the user's $HOME-folder." },

  { id: ACHIEVEMENTS.PipewireOnly, description: "Your app supports only Pipewire. Pipewire supports isolation between apps. Pipewire is enabled with \"--filesystem=xdg-run/pipewire-0\""}
]
