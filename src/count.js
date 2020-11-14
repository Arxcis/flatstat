import repos from "./db/flathub/repos.js";
import metadata from "./db/flathub/metadata.js";
import { writeFile } from "fs/promises";
const count = {
    repos: repos.reduce((acc) => acc + 1, 0),
    wayland: metadata.reduce((acc, it) => acc + it.socketWayland, 0),
    x11: metadata.reduce((acc, it) => acc + it.socketX11, 0),
    onlyX11: metadata.reduce((acc, it) => acc + (it.socketX11 && !it.socketWayland), 0),
    onlyWayland: metadata.reduce((acc, it) => acc + (!it.socketX11 && it.socketWayland), 0),
    bothX11AndWayland: metadata.reduce((acc, it) => acc + (it.socketX11 && it.socketWayland), 0),
    noGUI: metadata.reduce((acc, it) => acc + (!it.socketX11 && !it.socketWayland), 0),
};
console.log({ count });
await writeFile("./src/db/flathub/count.js", `export default ${JSON.stringify(count, null, 2)}`);
