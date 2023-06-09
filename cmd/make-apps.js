import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { RestConfig } from "./config.js";

const APPS_JSON = "./data/flathub/apps.json";

let apps = [];
let next = "https://api.github.com/orgs/flathub/repos?per_page=100";
const NON_APP_PATTERNS = [
  "org.freedesktop.LinuxAudio.",
  "org.freedesktop.Platform.",
  ".Extensions.",
  ".extensions.",
  ".Extension.",
  ".Plugin.",
  ".plugin.",
  ".Addon.",
  ".Utility.",           // example: Protontricks | Mangohud
  ".CompatibilityTool.", // example: proton | Boxtron
  ".BaseApp",
  "org.gtk.Gtk3theme.",
  "org.kde.KStyle.",
  "org.kde.PlatformTheme.",
  "io.dbeaver.DBeaverCommunity.Client.",        // example: pgsql | mariadb
  "org.gnome.Crosswords.PuzzleSets.",
  "org.kicad.KiCad.ODBCDriver.",
  "org.kde.WaylandDecoration.QGnomePlatform-decoration"
];

do {
  // Fetch next page
  const res = await fetch(next, RestConfig);
  if (!res.ok) {
    console.error({res})
    process.exit(1);
  }

  const json = (await res.json()) ?? [];

  const activeRepos = json.filter((it) => !it.archived && !it.disabled);

  apps = [
    ...apps,
    ...activeRepos
      .filter((it) => it.name.includes("."))
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
