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

export type SinglePairing = { statement: string; color: string };

export type Pairings = {
  [name: string]: SinglePairing;
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

type unparsedPeople = { [name: string]: string };

const parsePeople = (people: unparsedPeople) => {
  return Object.entries(people).reduce((acc: People, [key, val]) => {
    acc[key] = JSON.parse(val);
    return acc;
  }, {});
};

const milpApiUrl =
  process.env.NODE_ENV === "production"
    ? "https://crux-milp-api.onrender.com/pair"
    : "http://127.0.0.1:8000/pair";

const getPairings = async (statements: string[], people: People) => {
  if (Object.keys(people).length % 2 == 0) {
    // use the MILP API
    try {
      const fetchData = { statements, people };
      const headers = new Headers();
      headers.set("Content-Type", "application/json");

      const fetchOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(fetchData),
      };
      const pairings = await fetch(milpApiUrl, fetchOptions).then((res) =>
        res.json()
      );
      return pairings;
    } catch (err) {
      // if the MILP API fails for any reason
      // fall back to using the calculate() function
    }
  }
  const pairings = calculate(statements, people);
  return pairings;
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { room } = Object.fromEntries(body);

  const statements: string[] = await redis
    .get(`${room}:statements`)
    .then((res: any) => JSON.parse(res));

  const people: People = await redis
    .hgetall(`${room}:people`)
    .then((res) => parsePeople(res));

  if (statements?.length === 0 || Object.keys(people).length === 0)
    return null;

  const pairings = await getPairings(statements, people);
  await redisSet(`${room}:pairings`, JSON.stringify(pairings));

  return null;
};
