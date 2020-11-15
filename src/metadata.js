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
    index += 1;

    //
    // ignore names which does not include atleast two periods '.'
    //
    // Example valid name: 'com.github.Flacon' or 'org.robocode.Robocode
    // Exampe invalid name: 'flathub-tools' or 'blog'
    //
    if (!name.includes(".")) {
      console.log(
        `${index}: https://github.com/flathub/${name} -------> Ignoring`
      );
      continue;
    }

    let ext = null;
    let history = null;
    let branch = null;
    let stargazerCount = null;

    const json = await makeGqlQuery(name, "json");
    if (json) {
      branch = json.branch;
      stargazerCount = json.stargazerCount;
      history = parseCommits(json.commits);
      ext = "json";
    } else {
      const yaml = await makeGqlQuery(name, "yaml");
      if (yaml) {
        branch = yaml.branch;
        stargazerCount = yaml.stargazerCount;
        history = parseCommits(yaml.commits);
        ext = "yaml";
      } else {
        const yml = await makeGqlQuery(name, "yml");
        if (yml) {
          branch = yml.branch;
          stargazerCount = yml.stargazerCount;
          history = parseCommits(yml.commits);
          ext = "yml";
        } else {
          // not found
          console.log(
            `${index}: https://github.com/flathub/${name} -------> Not found`
          );
          continue;
        }
      }
    }

    console.log(
      `${index}: https://github.com/flathub/${name}/blob/${branch}/${name}.${ext} ${stargazerCount}`
    );

    const metadata = { index, name, ext, branch, stargazerCount, history };

    await appendFile(MEATDATA_JSON, `${JSON.stringify(metadata, null, 2)},`);
  }
}

function parseCommits(commits) {
  const history = commits.map(({ date, text }) => {
    const x11 = !!text?.match(/--socket=x11/);
    const fallbackX11 = !!text?.match(/--socket=fallback-x11/);
    const wayland = !!text?.match(/--socket=wayland/);
    const filesystemHome = !!text?.match(/--filesystem=home/);
    const filesystemHost = !!text?.match(/--filesystem=host/);
    const filesystem = !!text?.match(/--filesystem=/);
    const device = !!text?.match(/--device=/);
    const deviceAll = !!text?.match(/--device=all/);
    const pulseaudio = !!text?.match(/--socket=pulseaudio/);
    const finishArgs = !!text?.match(/(\"finish-args\")|(finish-args:)/);

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
      pulseaudio,
      finishArgs,
    };
  });

  return history;
}

async function makeGqlQuery(filename, ext) {
  const query = `\
query {\
    repository(name:"${filename}", owner:"flathub") {\
      name\
      stargazerCount
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
        stargazerCount,
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
    stargazerCount,
    commits: nodes.map(({ committedDate, file }) => ({
      date: committedDate,
      text: file?.object?.text ?? null,
    })),
  };
}
