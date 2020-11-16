import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { RestConfig } from "./config.js";

let repos = [];
let next = "https://api.github.com/orgs/flathub/repos?per_page=100";

do {
  // Fetch next page
  const res = await fetch(next, RestConfig);
  const json = (await res.json()) ?? [];

  const activeRepos = json.filter(it => !it.archived && !it.disabled)

  repos = [
    ...repos, 
    ...activeRepos.filter(it => it.name.includes("."))
      .filter(it => !it.name.startsWith("org.gtk.Gtk3theme."))
      .filter(it => !it.name.startsWith("org.freedesktop.LinuxAudio."))
      .filter(it => !it.name.startsWith("org.freedesktop.Platform."))
      .filter(it => !it.name.startsWith(".Extension."))
      .filter(it => !it.name.includes(".Plugin."))
      .filter(it => !it.name.includes(".BaseApp"))
      .map((it) => it.name)
  ];

  // Parse next header
  const link = res.headers?.get("link");
  const [, n] = link?.match(/(https:\/\/\S*)>; rel="next"/) ?? [null, null];
  next = n;
  console.log({ next });
} while (next);

await writeFile(
  "./db/flathub/repos.js",
  `export default ${JSON.stringify(repos, null, 2)}`
);
