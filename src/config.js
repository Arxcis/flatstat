// PAT with no scopes. Readonly to public information on github
const PAT = "64c0ffde304a67cd3cab32f23290440d754b52c2";
export const FetchConfig = {
    headers: {
        Authorization: `token ${PAT}`,
    },
};
