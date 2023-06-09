// PAT with no scopes. Readonly to public information on github
const PAT = process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? "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";
export const RestConfig = {
  headers: {
    Authorization: `token ${PAT}`,
    "Content-Type": "application/json",
  },
};

export const GqlConfig = {
  headers: {
    Authorization: `bearer ${PAT}`,
    "Content-Type": "application/json",
  },
};

export const MONTHS = [
  "2020-05",
  "2020-06",
  "2020-07",
  "2020-08",
  "2020-09",
  "2020-10",
  "2020-11",
  "2020-12",
  "2021-01",
  "2021-02",
  "2021-03",
  "2021-04",
  "2021-05",
  "2021-06",
  "2021-07",
  "2021-08",
  "2021-09",
  "2021-10",
  "2021-11",
  "2021-12",
  "2022-01",
  "2022-02",
  "2022-03",
  "2022-04",
  "2022-05",
  "2022-06",
  "2022-07",
  "2022-08",
  "2022-09",
  "2022-10",
  "2022-11",
  "2022-12",
  "2023-01",
  "2023-02",
  "2023-03",
  "2023-04",
  "2023-05",
  "2023-06"
];
