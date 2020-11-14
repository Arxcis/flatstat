import fetch from "node-fetch";
import { writeFile } from "fs/promises";

let repos = [];

import { FetchConfig } from "./config.js";

let next = "https://api.github.com/orgs/flathub/repos?per_page=100";
do {
  // Fetch next page
  const res = await fetch(next, FetchConfig);
  const json = (await res.json()) ?? [];
  repos = [...repos, ...mapRepos(json)];

  // Parse next header
  const link = res.headers?.get("link");
  const [, n] = link?.match(/(https:\/\/\S*)>; rel="next"/) ?? [null, null];
  next = n;
  console.log({ next });
} while (next);

await writeFile(
  "src/db/flathub/repos.js",
  `export default ${JSON.stringify(repos, null, 2)}`
);

type Repo = {
  // Example: "org.gnome.Recipes"
  name: string;

  // example: "flathub/org.gnome.Recipes"
  full_name: string;

  // Example: "master"
  default_branch: string;
};

function mapRepos(githubRepo: any[]): Repo[] {
  return githubRepo.map((it) => {
    return {
      name: it.name,
      full_name: it.full_name,
      default_branch: it.default_branch,
    };
  });
}
