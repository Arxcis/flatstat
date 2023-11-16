
import fetch from "node-fetch";
import yaml from "js-yaml";
import stripJsonComments from "strip-json-comments";
import { GqlConfig, MONTHS } from "./config.js";

/**
 * @param {string} appID example: "com.valvesoftware.Steam"
 */
export async function queryMetafileHistory(appID) {

  // 0. Construct request to Github gql API
  const query = `{
    repository(name: "${appID}", owner: "flathub") {
      name
      stargazerCount
      defaultBranchRef {
        name
        target {
          ... on Commit {
            json: history(since: "${MONTHS[0]}-01T00:00:00Z" path: "${appID}.json") {
              nodes {
                committedDate
                file(path: "${appID}.json") {
                  object {
                    ... on Blob {
                      text
                    }
                  }
                }
              }
            }
            yaml: history(since: "${MONTHS[0]}-01T00:00:00Z" path: "${appID}.yaml") {
              nodes {
                committedDate
                file(path: "${appID}.yaml") {
                  object {
                    ... on Blob {
                      text
                    }
                  }
                }
              }
            }
            yml: history(since: "${MONTHS[0]}-01T00:00:00Z" path: "${appID}.yml") {
              nodes {
                committedDate
                file(path: "${appID}.yml") {
                  object {
                    ... on Blob {
                      text
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;

  const body = JSON.stringify({ query });
  
  // 1. Send request
  const res = await fetch("https://api.github.com/graphql", {
    ...GqlConfig,
    method: "POST",
    body,
  });

  const jsonRes = await res.json();

  if (!jsonRes.data?.repository?.defaultBranchRef) {
    console.log(JSON.stringify(jsonRes, null, 2));
    return null;
  }

  // 2. Unpack result from Github
  let {
    data: {
      repository: {
        stargazerCount,
        defaultBranchRef: {
          name: branch,
          target: {
            json: rawJson,
            yaml: rawYaml,
            yml: rawYml,
          },
        },
      },
    },
  } = jsonRes;


  // 3. Parse yaml
  const parsedYaml = rawYaml.nodes.map(({committedDate, file}) => {
    const text = file?.object?.text ?? null
    const ext = "yaml"

    try {
      const metafile = yaml.safeLoad(text)
      return _parseFinishArgs(metafile, ext, committedDate)
    } catch (err){
      // invalid yaml. Moving on...
      return {
        ext,
        date: committedDate,
        status: `ill-formed-yaml: ${err.message}`,
        finishArgs: null,
      };
    }
  })

  // 4. Parse yml
  const parsedYml = rawYml.nodes.map(({committedDate, file}) => {
    const text = file?.object?.text ?? null
    const ext = "yml"
    try {
      const metafile = yaml.safeLoad(text)
      return _parseFinishArgs(metafile, ext, committedDate)
    } catch (err){
      // invalid yml. Moving on...
      return {
        ext,
        date: committedDate,
        status: `ill-formed-yml: ${err.message}`,
        finishArgs: null,
      };
    }
  })

  // 5. Parse json
  const parsedJson = rawJson.nodes.map(({committedDate, file}) => {
    const text = file?.object?.text ?? null
    const ext = "json"
    try {
      // Try to make JSON better formed, before parsing it, to get fewer "ill-formed" results.
      const jsonWithoutComments = stripJsonComments(text);
      const jsonWithoutWhitespace = jsonWithoutComments.replace(/\s/g, "")

      const metafile = JSON.parse(jsonWithoutWhitespace)
      return _parseFinishArgs(metafile, ext, committedDate);
    } catch (err) {
      // invalid json. Moving on...
      return {
        ext,
        date: committedDate,
        status: `ill-formed-json: ${err.message}`,
        finishArgs: null,
      };
    }
  })

  function _parseFinishArgs(metafile, ext, date) {
    if (!metafile) {
      // file must have been deleted in this commit. Moving on...
      return {
        ext,
        date,
        status: "empty",
        finishArgs: null,
      };
    }

    const finishArgs = metafile["finish-args"]
    if (!finishArgs) {
      return {
        ext,
        date,
        status: "finish-args-not-found",
        finishArgs: null,
      }
    }

    return {
      ext,
      date,
      status: "ok",
      finishArgs: [...finishArgs].sort(),
    };   
  }

  // 6. Combine history
  const history = [...parsedYaml, ...parsedYml, ...parsedJson];
  if (history.length == 0) {
    return null;
  }

  // 7. Sort oldest -> newest date
  const historyFromOldest = [...history].sort((a, b) => a.date.localeCompare(b.date));

  // 8. De-duplication strategy: Only keep history-entries which have a difference from previous entry
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

  // 9. Trim the history to contain one entry per month, which should be the latest entry per month
  const historyFromNewest = [...deDuplicatedHistory].sort((a, b) => a.date.localeCompare(b.date.localeCompare));

  const trimmedHistory = MONTHS
    .map(month => historyFromNewest.find(it => it.date.startsWith(month)))
    .filter(it => it)
    .reverse()

  // 10. Get the file-extension of the latest history entry
  const ext = trimmedHistory[0]?.ext ?? null;
  const status = trimmedHistory[0]?.status ?? null;

  // 11. Concat the displayURL
  const displayURL = ext ? `https://github.com/flathub/${appID}/blob/${branch}/${appID}.${ext}` : `https://github.com/flathub/${appID}`;

  // 12. Bundle what we learned into a metafile object
  const metafile = { appID, displayURL, ext, status, branch, stargazerCount, history: trimmedHistory };

  return metafile;
}