import { redis } from "~/utils/redis.server";

const colors = ["red", "blue", "green", "purple", "yellow", "pink"];

export const getResult = async (roomName: string, person: number) => {
  const idx = person - 1;
  try {
    const result = await redis
      .get(`${roomName}.result`)
      .then((res) => JSON.parse(res));
    return result[idx];
  } catch (error) {
    return null;
  }
};

export const calculatePairs = async (roomName: string) => {
  const statements = await redis
    .get(`${roomName}.statements`)
    .then((res) => JSON.parse(res));

  const ratings = await redis
    .lrange(`${roomName}.ratings`, 0, -1)
    .then((res) => res.map((r) => JSON.parse(r).map((n) => parseInt(n))));

  const done = [];
  const result = ratings.map((r) => ({}));
  statements.forEach((s, i) => {
    const rat = ratings.map((r) => r[i]);
    const ratFiltered = rat.filter((r, i) => !done.includes(i));
    const min = rat.indexOf(Math.min(...ratFiltered));
    const max = rat.indexOf(Math.max(...ratFiltered));
    if (min >= 0 && max >= 0) {
      done.push(min, max);
      const color = colors[i];
      result[min] = { statement: s, color: color };
      result[max] = { statement: s, color: color };
    }
  });
  await redis.set(`${roomName}.result`, JSON.stringify(result));
  return result;
};
