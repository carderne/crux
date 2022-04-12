import type { ActionFunction } from "@remix-run/node";
import { redis } from "~/utils/redis.server";

const colors = ["red", "blue", "green", "purple", "yellow", "pink"];

export const calculatePairs = (statements, ratings) => {
  const done = [];
  const pairings = ratings.map((r) => ({}));
  statements.forEach((s, i) => {
    const rat = ratings.map((r) => r[i]);
    const ratFiltered = rat.filter((r, i) => !done.includes(i));
    const min = rat.indexOf(Math.min(...ratFiltered));
    const max = rat.indexOf(Math.max(...ratFiltered));
    if (min >= 0 && max >= 0) {
      done.push(min, max);
      const color = colors[i];
      pairings[min] = { statement: s, color: color };
      pairings[max] = { statement: s, color: color };
    }
  });
  return pairings;
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { room} = Object.fromEntries(body);

  const statements = await redis
    .get(`${room}.statements`)
    .then((res) => JSON.parse(res));

  const ratings = await redis
    .lrange(`${room}.ratings`, 0, -1)
    .then((res) => res.map((r) => JSON.parse(r).map((n) => parseInt(n))));

  if (statements?.length === 0 || ratings?.length === 0) return null;

  const pairings = calculatePairs(statements, ratings);
  await redis.set(`${room}.pairings`, JSON.stringify(pairings));

  return null;
};
