import { FetchConfig } from "./config.js";
import fetch from "node-fetch";
import repos from "./db/flathub/repos.js";
import { writeFile } from "fs/promises";
let metadatas = [];
let index = 0;
for (const { name, full_name, default_branch } of repos) {
    let waylandSocket = false;
    let x11Socket = false;
    const json = await fetch(`https://raw.githubusercontent.com/${full_name}/${default_branch}/${name}.json`, FetchConfig);
    /** json */
    if (json.ok) {
        const jsonStr = await json.text();
        if (jsonStr.match(/--socket=wayland/)) {
            waylandSocket = true;
        }
        if (jsonStr.match(/--socket=x11/)) {
            x11Socket = true;
        }
    } /** yaml */
    else {
        const yaml = await fetch(`https://raw.githubusercontent.com/${full_name}/${default_branch}/${name}.yaml`, FetchConfig);
        if (yaml.ok) {
            const yamlStr = await yaml.text();
            if (yamlStr.match(/--socket=wayland/)) {
                waylandSocket = true;
            }
            if (yamlStr.match(/--socket=x11/)) {
                x11Socket = true;
            }
        }
    }
    const metadata = { index, name, waylandSocket, x11Socket };
    console.log({ metadata });
    index += 1;
    metadatas.push(metadata);
}
await writeFile(`./src/db/flathub/metadata.js`, `export default ${JSON.stringify(metadatas, null, 2)}`);
