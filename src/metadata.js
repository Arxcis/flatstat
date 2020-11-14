import { GqlConfig } from "./config.js";
import fetch from "node-fetch";
import repos from "./db/flathub/repos.js";
import { appendFile, unlink } from "fs/promises";
let index = 0;

const MEATDATA_JSON = "./src/db/flathub/metadata.js";

await unlink(MEATDATA_JSON);
await appendFile(MEATDATA_JSON, "export default [");
await makeMetadata(repos);
await appendFile(MEATDATA_JSON, "]");

async function makeMetadata(repos) {
  for (const { name } of repos) {
    const json = await makeGqlQuery(name, "json");
    let ext = null;
    let history = null;

    if (json) {
      history = parseHistory(json);
      ext = "json";
    } else {
      const yaml = await makeGqlQuery(name, "yaml");

      if (yaml) {
        history = parseHistory(yaml);
        ext = "yaml";
      }
    }

    const metadata = { index, name, ext, history };
    console.log(index);

    await appendFile(MEATDATA_JSON, `${JSON.stringify(metadata, null, 2)},`);
    index += 1;
  }
}

function parseHistory(history) {
  const transformed = history.map(({ date, text }) => {
    const x11 = !!text?.match(/--socket=x11/);
    const fallbackX11 = !!text?.match(/--socket=fallback-x11/);
    const wayland = !!text?.match(/--socket=wayland/);
    const filesystemHome = !!text?.match(/--filesystem=home/);
    const filesystemHost = !!text?.match(/--filesystem=host/);
    const filesystem = !!text?.match(/--filesystem=/);
    const device = !!text?.match(/--device=/);
    const deviceAll = !!text?.match(/--device=all/);

    return {
      date,
      x11,
      wayland,
      filesystem,
      filesystemHome,
      filesystemHost,
      device,
      deviceAll,
    };
  });

  return transformed;
}

async function makeGqlQuery(filename, ext) {
  const query = `\
query {\
    repository(name:"${filename}", owner:"flathub") {\
      name\
      defaultBranchRef {\
        target {\
          ... on Commit {\
            history(since: "2018-01-01T00:00:00Z", path:"${filename}.${ext}") {\
              nodes {\
                committedDate\
                file(path:"${filename}.${ext}") {\
                  object {\
                    ... on Blob {\
                      text\
                    }\
                  }\
                }\
              }\
            }\
          }\
        }\
      }\
    }\
  }\
`;
  const body = JSON.stringify({ query });
  const res = await fetch("https://api.github.com/graphql", {
    ...GqlConfig,
    method: "POST",
    body,
  });

  const json = await res.json();

  if (!json.data?.repository?.defaultBranchRef) {
    console.log(JSON.stringify(json, null, 2));
    return null;
  }

  const {
    data: {
      repository,
      repository: {
        name,
        defaultBranchRef: {
          target: {
            history: { nodes },
          },
        },
      },
    },
  } = json;

  return nodes.map(({ committedDate, file }) => ({
    date: committedDate,
    text: file?.object?.text ?? null,
  }));
}
