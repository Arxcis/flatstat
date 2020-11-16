import { queryMetafileHistory } from "./query.js"

await testQueryCommitHistory();

async function testQueryCommitHistory() {
    const metafile = await queryMetafileHistory("com.valvesoftware.Steam")
    console.log(metafile.history.map(it => it.date))
}
