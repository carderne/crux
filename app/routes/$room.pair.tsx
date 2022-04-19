import type { LoaderFunction } from "@remix-run/node";
import type { SinglePairing, Pairings } from "./pair";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { redis } from "~/utils/redis.server";
import { cookieId } from "~/utils/utils";

export const getPairs = async (
  room: string,
  id: string
): Promise<SinglePairing | null> => {
  try {
    const result: Pairings = await redis
      .get(`${room}:pairings`)
      .then((res: any) => JSON.parse(res));
    return result[id];
  } catch (error) {
    return null;
  }
};

const checkAdmin = async (room: string, id: string): Promise<boolean> => {
  try {
    const adminId = await redis.get(`${room}:admin`);
    return id === adminId;
  } catch (err) {
    return false;
  }
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const room = params.room;
  const id = cookieId(request);
  if (typeof room === "string" && typeof id === "string") {
    const result = await getPairs(room, id);
    const isAdmin = await checkAdmin(room, id);
    return json({
      room,
      result,
      isAdmin,
    });
  }
  throw new Error("Problem with `room` or `id`");
};

export default function Room() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const userIsAdmin = data.isAdmin;
  const refresh = () => window.location.reload();
  const pair = () =>
    fetcher.submit({ room: data.room }, { method: "post", action: `/pair` });

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
