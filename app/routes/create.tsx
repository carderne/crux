import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import animals from "~/utils/animals";
import adjectives from "~/utils/adjectives";

const random = (arr: Array<string>) =>
  arr[Math.floor(Math.random() * arr.length)];

export const loader: LoaderFunction = async () => {
  const room = `${random(adjectives)}-${random(animals)}`;
  return redirect(`/${room}/create`);
};
