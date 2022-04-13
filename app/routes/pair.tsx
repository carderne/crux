import type { ActionFunction } from "@remix-run/node";
import { redis, redisSet } from "~/utils/redis.server";

const colors = [
  "#1f78b4",
  "#33a02c",
  "#e31a1c",
  "#ff7f00",
  "#6a3d9a",
  "#b15928",
  "#a6cee3",
  "#b2df8a",
  "#fb9a99",
  "#fdbf6f",
  "#cab2d6",
  "#ffff99",
];

type People = {
  [name: string]: number[];
};

export type Pairings = {
  [name: string]: { statement: string; color: string };
};

export const calculate = (statements: string[], people: People) => {
  const pairings: Pairings = {};
  let colorIdx = 0;
  Object.entries(people).forEach(([p, ratings]) => {
    if (!(p in pairings)) {
      let [partner, most, s] = ["", -1, -1];
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

type unparsedRatings = { [name: string]: string };

const parseRatings = (ratings: unparsedRatings) => {
  console.log(ratings);
  return Object.entries(ratings).reduce((acc: People, [key, val]) => {
    acc[key] = JSON.parse(val);
    return acc;
  }, {});
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { room } = Object.fromEntries(body);

  const statements: string[] = await redis
    .get(`${room}:statements`)
    .then((res: any) => JSON.parse(res));

  const ratings: People = await redis
    .hgetall(`${room}:ratings`)
    .then((res) => parseRatings(res));

  if (statements?.length === 0 || Object.keys(ratings).length === 0)
    return null;

  const pairings = JSON.stringify(calculate(statements, ratings));
  await redisSet(`${room}:pairings`, pairings);

  return null;
};
