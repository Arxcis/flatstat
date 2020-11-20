import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { RestConfig } from "./config.js";

const APPS_JSON = "./data/flathub/apps.json";

let apps = [];
let next = "https://api.github.com/orgs/flathub/repos?per_page=100";
const NON_APP_LIST = [
  "org.gtk.Gtk3theme.",
  "org.freedesktop.LinuxAudio.",
  "org.freedesktop.Platform.",
  ".Extension.",
  ".Plugin.",
  ".BaseApp",
  "org.kde.KStyle.",
  "org.kde.PlatformTheme.",
];

do {
  // Fetch next page
  const res = await fetch(next, RestConfig);
  const json = (await res.json()) ?? [];

  const activeRepos = json.filter((it) => !it.archived && !it.disabled);

  apps = [
    ...apps,
    ...activeRepos
      .filter((it) => it.name.includes("."))
      .filter((it) => NON_APP_LIST.every((ignore) => !it.name.includes(ignore)))
      .map((it) => it.name),
  ];

  // Parse next header
  const link = res.headers?.get("link");
  const [, n] = link?.match(/(https:\/\/\S*)>; rel="next"/) ?? [null, null];
  next = n;
  console.log({ next });
} while (next);

await writeFile(APPS_JSON, JSON.stringify(apps, null, 2));