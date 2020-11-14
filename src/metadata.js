import { FetchConfig } from "./config.js";
import fetch from "node-fetch";
import repos from "./db/flathub/repos.js";
import { writeFile } from "fs/promises";
let metadatas = [];
let index = 0;

for (const { name, full_name, default_branch } of repos) {
  let wayland = false;
  let x11 = false;
  let filesystem = false;
  let filename = `https://raw.githubusercontent.com/${full_name}/${default_branch}/${name}.json`;
  let found = false;
  const json = await fetch(filename, FetchConfig);

  if (json.ok) {
    /** json */
    const jsonStr = await json.text();
    found = true;
    wayland = !!jsonStr.match(/--socket=wayland/);
    x11 = !!jsonStr.match(/--socket=x11/);
    filesystem = !!jsonStr.match(/--filesystem=/);
  } else {
    /** yaml */
    filename = `https://raw.githubusercontent.com/${full_name}/${default_branch}/${name}.yaml`;
    const yaml = await fetch(filename, FetchConfig);
    if (yaml.ok) {
      const yamlStr = await yaml.text();
      found = true;
      wayland = !!yamlStr.match(/--socket=wayland/);
      x11 = !!yamlStr.match(/--socket=x11/);
      filesystem = !!yamlStr.match(/--filesystem=/);
    }
  }

  const metadata = { index, x11, wayland, filesystem, found, filename };
  console.log({ metadata });
  index += 1;
  metadatas.push(metadata);
}

await writeFile(
  `./src/db/flathub/metadata.js`,
  `export default ${JSON.stringify(metadatas, null, 2)}`
);
