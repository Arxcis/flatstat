
import fetch from "node-fetch";
import yaml from "js-yaml";
import stripJsonComments from "strip-json-comments";
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

  // 2. Pick a branch and stargazer count. Should be the same across queries.
  const branch = json?.branch ?? yaml?.branch ?? yml?.branch;
  const stargazerCount = json?.stargazerCount ?? yaml?.stargazerCount ?? yml?.stargazerCount;

  // 3. Parse commit history
  const jsonHistory = json ? parseCommits(json.commits) : [];
  const yamlHistory = yaml ? parseCommits(yaml.commits) : [];
  const ymlHistory = yml ? parseCommits(yml.commits) : [];

  // 4. Merge
  const history = [
    ...jsonHistory,
    ...yamlHistory,
    ...ymlHistory,
  ]
  // Sort oldest -> newest date
  const historyFromOldest = [...history].sort((a, b) => a.date.localeCompare(b.date.localeCompare));

  // 5. De-duplication strategy: Only keep history-entries which have a difference from previous entry
  const deDuplicatedHistory = historyFromOldest
    .map((it, index) => {
      // If first entry, moving on...
      if (index === 0) {
        return it;
      }

      // Look back in history
      const prev = historyFromOldest[index - 1]
      const isDuplicateOfPrevious =
        JSON.stringify({
          ext: prev.ext,
          status: prev.status,
          finishArgs: prev.finishArgs
        }) === JSON.stringify({
          ext: it.ext,
          status: it.status,
          finishArgs: it.finishArgs
        });

      if (isDuplicateOfPrevious) {
        return {
          ...it,
          status: "duplicate",
          finishArgs: null,
        };
      }

      return it;
    }).filter(it => it.status !== "duplicate")



  // 6. Trim the history to contain one entry per month, which should be the latest entry per month
  const historyFromNewest = [...deDuplicatedHistory].sort((a, b) => a.date.localeCompare(b.date.localeCompare));

  const trimmedHistory = MONTHS
    .map(month => historyFromNewest.find(it => it.date.startsWith(month)))
    .filter(it => it)
    .reverse()

  // 7. Get the file-extension of the latest history entry
  const ext = trimmedHistory[0]?.ext ?? null;
  const status = trimmedHistory[0]?.status ?? null;

  // 8. Concat the displayURL
  const displayURL = ext ? `https://github.com/flathub/${appID}/blob/${branch}/${appID}.${ext}` : `https://github.com/flathub/${appID}`;

  // 9. Bundle what we learned into a metafile object
  const metafile = { appID, displayURL, ext, status, branch, stargazerCount, history: trimmedHistory };

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
        stargazerCount\
        defaultBranchRef {\
          name
          target {\
            ... on Commit {\
              history(since: "${MONTHS[0]}-01T00:00:00Z", path:"${appID}.${ext}") {\
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

/**
 * @param {{ date: string, text: string, ext: "json"|"yaml"|"yml"}[]} commits
 *
 * @returns {{
 *   ext: string,
 *   date: string,
 *   status: "ill-formed"|"empty"|"missing-finish-args"|"ok"
 *   finishArgs: {
 *     socket: string[],
 *     allow: string[],
 *     device: string[],
 *     extension: string[],
 *     filesystem: string[],
 *     persist: string[],
 *     share: string[],
 *     socket: string[],
 *     talkName: string[]
 *   }|null
 * }}
 */
function parseCommits(commits) {
  const history = commits
    .map(({ date, text, ext }) => {

      let meta;
      try {
        if (ext === "yml" || ext === "yaml") {
          meta = yaml.safeLoad(text)
        } else {
          // Try to make JSON better formed, before parsing it, to get fewer "ill-formed" results.
          const jsonWithoutComments = stripJsonComments(text);
          const jsonWithoutWhitespace = jsonWithoutComments.replace(/\s/g, "")

          meta = JSON.parse(jsonWithoutWhitespace);
        }
      } catch {
        // invalid json or yaml. Moving on...
        return {
          ext,
          date,
          status: "ill-formed",
          finishArgs: null,
        };
      }

      if (!meta) {
        // file must have been deleted in this commit. Moving on...
        return {
          ext,
          date,
          status: "empty",
          finishArgs: null,
        };
      }

      const finishArgs = meta["finish-args"]
      if (!finishArgs) {
        return {
          ext,
          date,
          status: "missing-finish-args",
          finishArgs: null,
        }
      }

      return {
        ext,
        date,
        status: "ok",
        finishArgs: [...finishArgs].sort(),
      };
    })

  return history;
}
