import type { ActionFunction } from "@remix-run/node";
import { redis, redisSet } from "~/utils/redis.server";

const colors = [
  "#1f78b4",  // db
  "#33a02c",  // dg
  "#e31a1c",  // dr
  "#ff7f00",  // do
  "#6a3d9a",  // dp
  "#b15928",  // dy
  "#a6cee3",  // lb
  "#b2df8a",  // lg
  "#fb9a99",  // lr
  "#fdbf6f",  // lo
  "#cab2d6",  // lp
  "#ffff99",  // ly
];

export const calculate = (statements, people) => {
  const pairings = {};
  let colorIdx = 0;
  Object.entries(people).forEach(([p, ratings]) => {
    if (!(p in pairings)) {
      let [partner, most, s] = ["", -1, null];
      ratings.forEach((r, i) => {
        Object.entries(people).forEach(([o, o_ratings]) => {
          if (!(o in pairings || o === p)) {
            const score = Math.abs(r - o_ratings[i]);
            if (score > most) {
              most = score;
              s = i;
              partner = o;
            }
          }
        });
      });
      if (partner !== "") {
        const color = colors[colorIdx];
        colorIdx++;
        pairings[p] = { statement: statements[s], color };
        pairings[partner] = { statement: statements[s], color };
      } else {
        pairings[p] = { statement: "Nobody matched!", color: "white" };
      }
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
    .get(`${room}:statements`)
    .then((res) => JSON.parse(res));

  const ratings = await redis
    .hgetall(`${room}:ratings`)
    .then((res) => parseRatings(res));

  if (statements?.length === 0 || ratings?.length === 0) return null;

  const pairings = JSON.stringify(calculate(statements, ratings));
  await redisSet(`${room}:pairings`, pairings);

  return null;
};
