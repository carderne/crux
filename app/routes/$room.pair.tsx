import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { redis } from "~/utils/redis.server";

export const getResult = async (room: string, person: number) => {
  const idx = person - 1;
  try {
    const result = await redis
      .get(`${room}.result`)
      .then((res) => JSON.parse(res));
    return result[idx];
  } catch (error) {
    return null;
  }
};

export const loader: LoaderFunction = async ({ params }) => {
  const room = params.room;
  const person = params.person;
  const result = await getResult(room, person);
  return json({
    room,
    result,
  });
};

export default function Room() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const userIsAdmin = true;

  const pair = () =>
    fetcher.submit({ room: data.room }, { method: "post", action: `/pair` });

  const refresh = () => window.location.reload();

  return (
    <div
      className="flex flex-grow flex-col p-10"
      style={{ backgroundColor: data.result ? data.result.color : "" }}
    >
      {data.result && (
        <div className="-mx-10 flex-grow">
          <div className="align-center flex h-full justify-center rounded-2xl p-20">
            <div className="m-auto text-center text-2xl italic">
              "{data.result.statement}"
            </div>
          </div>
        </div>
      )}
      {!data.result && (
        <div className="flex flex-grow flex-col justify-between">
          <div className="text-center text-xl">
            <div>🤐</div>
            <div>Pairings not ready yet...</div>
            <div>(try refreshing in a little while)</div>
          </div>
        </div>
      )}
      {userIsAdmin && (
        <div>
          <button
            type="button"
            onClick={pair}
            className="w-full rounded-xl bg-cyan-600 p-4 shadow-xl"
          >
            <div className="text-xl text-stone-50">Calculate pairings</div>
          </button>
        </div>
      )}
      {!userIsAdmin && (
        <div>
          <div
            onClick={refresh}
            className="mt-auto cursor-pointer rounded-xl bg-emerald-600 p-4 shadow-xl"
          >
            <div className="mx-auto text-center text-xl text-stone-50">
              Refresh
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
