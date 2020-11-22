export const HOLES = {
  X11: "--x11",
  FilesystemAll: "--filesystem-all",
  FilesystemUnknown: "--filesystem-unknown",
  FilesystemWellKnown: "--filesystem-well-known",
  DeviceAll: "--device-all",
  DeviceWellKnown: "--device-well-known",
  Pulseaudio: "--pulseaudio",
  TalksSessionName: "--talks-session-name",
  TalksSystemName: "--talks-system-name",
  OwnsSessionName: "--owns-session-name",
  OwnsSystemName: "--owns-system-name",
};

export const HOLE_DESCRIPTIONS = [
  { id: HOLES.X11, description: "Your app supports x11. x11 does not support isolation between apps, which enables your app to see what a user is doing in other apps. E.g. keylogging, screen capture." },

  { id: HOLES.FilesystemAll, description: "Your app has blanket access to all of the user's private files, because it is using permissions like --filesystem=home or --filesystem=host" },

  { id: HOLES.FilesystemUnknown, description: `Your app has blanket access to one or more unknown files or directories - outside of "well-known directories" like xdg-desktop, xdg-music, etc.` },

  { id: HOLES.FilesystemWellKnown, description: "Your app has blanket access to one or more of the well-known directories - like xdg-desktop, xdg-music, etc. This is better than having access to unknown files or directories, or access to all files or directories, but is still considred a hole, because there is no isolation between apps" },

  { id: HOLES.DeviceAll, description: "Your app has blanket access to all of the user's connected devices." },

  { id: HOLES.DeviceWellKnown, description: `Your app has blanket access to one or more of the user's "well-known devices", like --device=dri, or --device=kvm.` },

  { id: HOLES.Pulseaudio, description: "Your app has pulseaudio access. Pulseaudio does not support isolation between apps. Your app can listen to the microphone without asking the user. Your app can play sound without asking the user." },

  { id: HOLES.TalksSessionName, description: "Your app has declared that it is talking to one or more names on the session-bus, using: --talk-name=NAME" },

  { id: HOLES.TalksSystemName, description: "Your app has declared that it is talking to one or more names on the system-bus, using: --system-talk-name=NAME" },

  { id: HOLES.OwnsSessionName, description: "Your app has declared that it owns one or more names on the session-bus, using: --own-name=NAME" },

  { id: HOLES.OwnsSystemName, description: "Your app has declared that it owns one or more names on the system-bus, using: --system-own-name=NAME" },
]
