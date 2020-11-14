import repos from "./db/flathub/repos.js";
import { writeFile } from "fs/promises";
const counts = {
    repos: repos.reduce((acc) => acc + 1, 0),
};
await writeFile("./src/db/flathub/counts.js", `export default ${JSON.stringify(counts, null, 2)}`);
