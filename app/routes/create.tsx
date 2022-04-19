import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import animals from "~/utils/animals";
import adjectives from "~/utils/adjectives";
import { redisSet } from "~/utils/redis.server";
import { getId, cookieHeader } from "~/utils/utils";

const random = (arr: Array<string>) =>
  arr[Math.floor(Math.random() * arr.length)];

export const loader: LoaderFunction = async ({ request }) => {
  const room = `${random(adjectives)}-${random(animals)}`;
  const id = getId(request);
  await redisSet(`${room}:exists`, "true");
  await redisSet(`${room}:admin`, id);
  return redirect(`/${room}/create`, {
    headers: { "Set-Cookie": cookieHeader(id) },
  });
};
