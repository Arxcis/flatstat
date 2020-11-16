import fetch from "node-fetch";
import { GqlConfig, MONTHS } from "./config.js";

/**
 * @param {string} appID example: "com.valvesoftware.Steam"
 */
export async function queryMetafileHistory(appID) {
  // 1. Query the 3 known file extensions in parallell
  const [json, yaml, yml] = await Promise.all([
    queryCommitHistory(appID, "json"),
    queryCommitHistory(appID, "yaml"),
    queryCommitHistory(appID, "yml"),
  ]);
  if (!yaml && !yml && !json) {
    return null;
  }

  // 2. Pick a branch. Should be the same across queries.
  const branch = json?.branch ?? yaml?.branch ?? yml?.branch;

  // 3. Pick a stargazer count. Should be the same across queries.
  const stargazerCount =
    json?.stargazerCount ?? yaml?.stargazerCount ?? yml?.stargazerCount;

  // 4. Parse commit history
  const jsonHistory = json ? parseCommits(json.commits) : [];
  const yamlHistory = yaml ? parseCommits(yaml.commits) : [];
  const ymlHistory = yml ? parseCommits(yml.commits) : [];

  // 5. Merge and re-sort history
  const history = [
    ...jsonHistory,
    ...yamlHistory,
    ...ymlHistory,
  ].sort((a, b) => b.date.localeCompare(a.date));

  // 6. Trim the history to contain one entry per month, which should be the latest entry per month
  const trimmedHistory = MONTHS
    .reverse()
    .map(month => history.find(it => it.date.startsWith(month)))
    .filter(it => it)

  // 7. Get the file-extension of the latest history entry
  let ext = trimmedHistory[0]?.ext ?? null;

  // 8. Bundle what we learned into a metafile object
  const metafile = { appID, ext, branch, stargazerCount, history: trimmedHistory };

  return metafile;
}

/**
 * @param {string} appID example: "com.valvesoftware.Steam"
 * @param {string} ext json|yaml|yml
 */
async function queryCommitHistory(appID, ext) {
    const query = `\
  query {\
      repository(name:"${appID}", owner:"flathub") {\
        name\
        stargazerCount
        defaultBranchRef {\
          name
          target {\
            ... on Commit {\
              history(since: "2018-01-01T00:00:00Z", path:"${appID}.${ext}") {\
                nodes {\
                  committedDate\
                  file(path:"${appID}.${ext}") {\
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
      repository: {
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
