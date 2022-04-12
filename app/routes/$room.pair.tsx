import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { redis } from "~/utils/redis.server";
import { parseCookie } from "~/utils/utils";

export const getResult = async (room: string, id: string) => {
  try {
    const result = await redis
      .get(`${room}:pairings`)
      .then((res) => JSON.parse(res));
    return result[id];
  } catch (error) {
    return null;
  }
};

const checkAdmin = async (room, id) => {
  try {
    const adminId = await redis.get(`${room}:admin`);
    return id === adminId;
  } catch (err) {
    return false;
  }
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const room = params.room;
  const cookie = request.headers.get("cookie");
  const id = parseCookie(cookie)["id"];
  const result = await getResult(room, id);
  const isAdmin = await checkAdmin(room, id);
  return json({
    room,
    result,
    isAdmin,
  });
};

export default function Room() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const userIsAdmin = data.isAdmin;

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
