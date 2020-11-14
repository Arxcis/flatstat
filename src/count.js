import repos from "./db/flathub/repos.js";
import metadata from "./db/flathub/metadata.js";
import { writeFile } from "fs/promises";

const count = {
  repos: repos.reduce((acc) => acc + 1, 0),
  x11: metadata.reduce((acc, it) => acc + it.x11, 0),
  wayland: metadata.reduce((acc, it) => acc + it.wayland, 0),
  filesystem: metadata.reduce((acc, it) => acc + it.filesystem, 0),
  notFound: metadata.reduce((acc, it) => acc + !it.found, 0),
  onlyX11: metadata.reduce((acc, it) => acc + (it.x11 && !it.wayland), 0),
  onlyWayland: metadata.reduce((acc, it) => acc + (!it.x11 && it.wayland), 0),
  bothX11AndWayland: metadata.reduce(
    (acc, it) => acc + (it.x11 && it.wayland),
    0
  ),
  noGUI: metadata.reduce((acc, it) => acc + (!it.x11 && !it.wayland), 0),
};
console.log({ count });
await writeFile(
  "./src/db/flathub/count.js",
  `export default ${JSON.stringify(count, null, 2)}`
);
