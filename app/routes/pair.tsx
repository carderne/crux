import type { ActionFunction } from "@remix-run/node";
import { redis } from "~/utils/redis.server";

const colors = ["red", "blue", "green", "purple", "yellow", "pink"];

export const calculatePairs = (statements, ratings) => {
  const doneIds = [];
  const pairings = {};
  statements.forEach((s, i) => {
    const useKeys = Object.keys(ratings).filter((id) => !doneIds.includes(id));
    const minId = useKeys.reduce((a, b) =>
      ratings[a][i] < ratings[b][i] ? a : b
    );
    const maxId = useKeys.reduce((a, b) =>
      ratings[a][i] > ratings[b][i] ? a : b
    );
    if (true) {
      doneIds.push(minId, maxId);
      const color = colors[i];
      pairings[minId] = { statement: s, color: color };
      pairings[maxId] = { statement: s, color: color };
    }
  });
  return pairings;
};

const parseRatings = (ratings) => {
  return Object.entries(ratings).reduce(
    (acc, [key, val]) => ((acc[key] = JSON.parse(val)), acc),
    {}
  );
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { room } = Object.fromEntries(body);

  const statements = await redis
    .get(`${room}.statements`)
    .then((res) => JSON.parse(res));

  const ratings = await redis
    .hgetall(`${room}.ratings`)
    .then((res) => parseRatings(res));

  if (statements?.length === 0 || ratings?.length === 0) return null;

  const pairings = calculatePairs(statements, ratings);
  await redis.set(`${room}.pairings`, JSON.stringify(pairings));

  return null;
};
