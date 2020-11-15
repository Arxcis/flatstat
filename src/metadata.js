import { GqlConfig } from "./config.js";
import fetch from "node-fetch";
import repos from "../db/flathub/repos.js";
import { appendFile, unlink } from "fs/promises";
let index = 0;

const MEATDATA_JSON = "./db/flathub/metadata.js";

await unlink(MEATDATA_JSON);
await appendFile(MEATDATA_JSON, "export default [");
await makeMetadata(repos);
await appendFile(MEATDATA_JSON, "]");

async function makeMetadata(repos) {
  for (const { name } of repos) {
    //
    // ignore names which does not include atleast two periods '.'
    //
    // Example valid name: 'com.github.Flacon' or 'org.robocode.Robocode
    // Exampe invalid name: 'flathub.org' or 'blog'
    //
    if (
      name.IndexOf(".") !== name.LastIndexOf(".") &&
      name.IndexOf(".") !== -1
    ) {
      console.log("-------> Ignoring: ", name);
      continue;
    }

    let ext = null;
    let history = null;
    let branch = null;

    const json = await makeGqlQuery(name, "json");
    if (json) {
      branch = json.branch;
      history = parseCommits(json.commits);
      ext = "json";
    } else {
      const yaml = await makeGqlQuery(name, "yaml");
      if (yaml) {
        branch = yaml.branch;
        history = parseCommits(yaml.commits);
        ext = "yaml";
      } else {
        const yml = await makeGqlQuery(name, "yml");
        if (yml) {
          branch = yml.branch;
          history = parseCommits(yml.commits);
          ext = "yml";
        } else {
          console.log("-------> Not found: ", name);
          // not found
          continue;
        }
      }
    }

    const metadata = { index, name, ext, branch, history };
    console.log(
      `${index}: https://github.com/flathub/${name}/blob/${branch}/${name}.${ext}`
    );

    await appendFile(MEATDATA_JSON, `${JSON.stringify(metadata, null, 2)},`);
    index += 1;
  }
}

function parseCommits(history) {
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
      fallbackX11,
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
        name
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
          name: branch,
          target: {
            history: { nodes },
          },
        },
      },
    },
  } = json;

  if (nodes.length === 0) {
    return null;
  }

  return {
    branch,
    commits: nodes.map(({ committedDate, file }) => ({
      date: committedDate,
      text: file?.object?.text ?? null,
    })),
  };
}
