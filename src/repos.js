import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { RestConfig } from "./config.js";

let repos = [];
let next = "https://api.github.com/orgs/flathub/repos?per_page=100";

do {
  // Fetch next page
  const res = await fetch(next, RestConfig);
  const json = (await res.json()) ?? [];
  repos = [...repos, ...mapRepos(json)];

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

function mapRepos(githubRepo) {
  return githubRepo.map((it) => {
    return {
      name: it.name,
      full_name: it.full_name,
      default_branch: it.default_branch,
    };
  });
}
