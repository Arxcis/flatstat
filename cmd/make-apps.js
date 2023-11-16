import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { RestConfig } from "./config.js";

const APPS_JSON = "./data/flathub/apps.json";
const NON_APPS_JSON = "./data/flathub/non-apps.json";

let apps = [];
let non_apps = [];
let next = "https://api.github.com/orgs/flathub/repos?per_page=100";
const NON_APP_PATTERNS = [
  "org.freedesktop.LinuxAudio.",
  "org.freedesktop.Platform.",
  ".Extensions.",
  ".extensions.",
  ".Extension.",
  ".BundledExtension.",
  ".Plugin.",
  ".plugin.",
  ".Addon.",
  ".Utility.",                    // .Protontricks, .Mangohud
  ".CompatibilityTool.",          // .proton, .Boxtron
  ".BaseApp",
  "org.gtk.Gtk3theme.",
  "org.kde.KStyle.",
  "org.kde.PlatformTheme.",
  "io.dbeaver.DBeaverCommunity.Client.", // .pgsql | .mariadb
  "org.gnome.Crosswords.PuzzleSets.", // .nienteperniente, .oedipus
  "org.kicad.KiCad.ODBCDriver.",  // .psqlodbc, .sqliteodbc
  "org.kicad.KiCad.Library.",     // .Templates, .Footprints, .Symbols
  "com.visualstudio.code.tool.",  // .fish, .podman
  "org.winehq.Wine.DLLs.",        // .dxvk
  "com.sublimetext.three.DevUtils",
  "org.kde.WaylandDecoration.",   // .QGnomePlatform-decoration, .QAdwaitaDecorations
  "org.gnome.Totem.Videosite.YouTubeDl",
  "com.fightcade.Fightcade.Wine",
  "org.telegram.desktop.webview",
  "com.hack_computer.Clippy.Extension",
  "org.qutebrowser.qutebrowser.Userscripts",
  "net._86box._86Box.ROMs",
];

do {
  // Fetch next page
  const res = await fetch(next, RestConfig);
  if (!res.ok) {
    console.error({res})
    process.exit(1);
  }

  const json = (await res.json()) ?? [];

  const activeRepos = json.filter((it) => !it.archived && !it.disabled)
    .filter((it) => it.name.includes("."))
  

  non_apps = [
    ...non_apps,
    ...activeRepos
      .filter((it) => NON_APP_PATTERNS.some((nonApp) => it.name.includes(nonApp)))
      .map((it) => it.name)
  ]

  apps = [
    ...apps,
    ...activeRepos
      .filter((it) => NON_APP_PATTERNS.every((nonApp) => !it.name.includes(nonApp)))
      .map((it) => it.name),
  ];

  // Parse next header
  const link = res.headers?.get("link");
  const [, n] = link?.match(/(https:\/\/\S*)>; rel="next"/) ?? [null, null];
  next = n;
  console.log({ next });
} while (next);

await writeFile(APPS_JSON, JSON.stringify(apps, null, 2));
await writeFile(NON_APPS_JSON, JSON.stringify(non_apps, null, 2))
