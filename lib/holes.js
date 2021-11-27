export const HOLES = {
  X11: "--x11",
  FilesystemHome: "--filesystem-home",
  FilesystemHost: "--filesystem-host",
  FilesystestemXDG: "--filesystem-xdg",
  FilesystemOther: "--filesystem-other",
  DeviceAll: "--device-all",
  DeviceDri: "--device-dri",
  DeviceShm: "--device-shm",
  OnlyPulseaudio: "--only-pulseaudio",
  PipewireAndPulseaudio: "--pipewire-and-pulseaudio",
  TalksSessionName: "--talks-session-name",
  TalksSystemName: "--talks-system-name",
  OwnsSessionName: "--owns-session-name",
  OwnsSystemName: "--owns-system-name",
};

export const HOLE_DESCRIPTIONS = [
  { id: HOLES.X11, description: "Your app supports x11. x11 does not support isolation between apps. E.g. keylogging, screen capture." },

  { id: HOLES.FilesystemHome, description: "Your app uses --filesystem=home, which gives access to entire $HOME and it's subdirectories." },

  { id: HOLES.FilesystemHost, description: "Your app uses --filesystem=host, --filesystem=host-etc." },

  { id: HOLES.FilesystemOther, description: `Your app has access to files in one ore more directories outside of the xdg-directories like xdg-desktop, xdg-music, etc.` },

  { id: HOLES.FilesystestemXDG, description: "Your app has access to files in one ore more xdg-directories - like xdg-desktop, xdg-music, etc." },

  { id: HOLES.DeviceAll, description: "Your app is using, --device=all which gives blanket access to all devices." },

  { id: HOLES.DeviceDri, description: `Your app is using --device=dri. Graphics direct rendering (/dev/dri).` },

  { id: HOLES.DeviceShm, description: `Your app is using --device=shm. Access to the host /dev/shm (/dev/shm).` },

  { id: HOLES.OnlyPulseaudio, description: "Your app uses pulseaudio. Pulseaudio does not support isolation between apps." },

  { id: HOLES.PipewireAndPulseaudio, description: "Your app supports both pipewire and pulseaudio."},

  { id: HOLES.TalksSessionName, description: "Your app has declared that it is talking to one or more names on the session-bus, using: --talk-name=NAME" },

  { id: HOLES.TalksSystemName, description: "Your app has declared that it is talking to one or more names on the system-bus, using: --system-talk-name=NAME" },

  { id: HOLES.OwnsSessionName, description: "Your app has declared that it owns one or more names on the session-bus, using: --own-name=NAME" },

  { id: HOLES.OwnsSystemName, description: "Your app has declared that it owns one or more names on the system-bus, using: --system-own-name=NAME" },
]
