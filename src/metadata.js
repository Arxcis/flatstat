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
    // 1. ignore names which does not include atleast a period '.'
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

    //
    // 2. There are three known metadata file extensions: .json, .yaml and .yml
    // Query the commit-history for all 3.
    //
    const [json, yaml, yml] = await Promise.all([
      queryCommitHistory(name, "json"),
      queryCommitHistory(name, "yaml"),
      queryCommitHistory(name, "yml"),
    ]);
    if (!yaml && !yml && !json) {
      // no history found
      console.log(
        `${index}: https://github.com/flathub/${name} -------> No history found`
      );
      continue;
    }

    // 3. Pick a branch. Should be the same across queries.
    const branch = json?.branch ?? yaml?.branch ?? yml?.branch;

    // 4. Pick a stargazer count. Should be the same across queries.
    const stargazerCount =
      json?.stargazerCount ?? yaml?.stargazerCount ?? yml?.stargazerCount;

    // 5. Parse commit history
    const jsonHistory = json ? parseCommits(json.commits) : [];
    const yamlHistory = yaml ? parseCommits(yaml.commits) : [];
    const ymlHistory = yml ? parseCommits(yml.commits) : [];

    // 6. Merge and re-sort history
    const history = [
      ...jsonHistory,
      ...yamlHistory,
      ...ymlHistory,
    ].sort((a, b) => b.date.localeCompare(a.date));

    // 7. Get the file-extension of the latest history entry
    let ext = history[0]?.ext ?? null;

    // 8. Log a line, to see progress when running the tool.
    console.log(
      `${index}: https://github.com/flathub/${name}/blob/${branch}/${name}.${ext} ${stargazerCount}`
    );

    // 9. Bundle what we learned into a metadata-object
    const metadata = { index, name, ext, branch, stargazerCount, history };

    // 10. Append metadata-object to file
    await appendFile(MEATDATA_JSON, `${JSON.stringify(metadata, null, 2)},`);
  }
}

function parseCommits(commits) {
  const history = commits.map(({ date, text, ext }) => {
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
      ext,
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

async function queryCommitHistory(filename, ext) {
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
      ext,
    })),
  };
}
