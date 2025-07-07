const PAT =
  process.env.GITHUB_PERSONAL_ACCESS_TOKEN ??
  "<missing an env.GITHUB_PERSONAL_ACCESS_TOKEN>";

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

const start = new Date("2018-01");
const end = new Date("2025-07");
export const MONTHS = [];

while (start <= end) {
  const month = start.toISOString().slice(0, 7);
  MONTHS.push(month);
  start.setMonth(start.getMonth() + 1);
}
console.log({ MONTHS });
