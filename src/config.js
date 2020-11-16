// PAT with no scopes. Readonly to public information on github
const PAT = "64c0ffde304a67cd3cab32f23290440d754b52c2";
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
  "2018-01",
  "2018-02",
  "2018-03",
  "2018-04",
  "2018-05",
  "2018-06",
  "2018-07",
  "2018-08",
  "2018-09",
  "2018-10",
  "2018-11",
  "2018-12",
  "2019-01",
  "2019-02",
  "2019-03",
  "2019-04",
  "2019-05",
  "2019-06",
  "2019-07",
  "2019-08",
  "2019-09",
  "2019-10",
  "2019-11",
  "2019-12",
  "2020-01",
  "2020-02",
  "2020-03",
  "2020-04",
  "2020-05",
  "2020-06",
  "2020-07",
  "2020-08",
  "2020-09",
  "2020-10",
  // "2020-11", Ignore current month
];