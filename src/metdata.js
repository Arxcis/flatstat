import fetch from "node-fetch";
import { FetchConfig } from "./config.js";
import repos from "./db/flathub/repos.js";
for (const { name, full_name, default_branch } of repos) {
  const json = await fetch(
    `https://raw.githubusercontent.com/${full_name}/${default_branch}/${name}.json`,
    FetchConfig
  );
  const jsonStr = await json.text();
  console.log({ jsonStr });
  const yaml = await fetch(
    `https://raw.githubusercontent.com/${full_name}/${default_branch}/${name}.yaml`,
    FetchConfig
  );
  const yamlStr = await yaml.text();
  console.log({ yamlStr });
  break;
}
