import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { redis } from "~/utils/redis.server";
import { getResult } from "~/utils/algorithm";

export const loader: LoaderFunction = async ({ params }) => {
  const roomName = params.roomName;
  const person = params.person;
  const result = await getResult(roomName, person);
  return json({
    roomName,
    result,
  });
};

export default function Room() {
  const data = useLoaderData();
  const fetcher = useFetcher();

  const ready = () =>
    fetcher.submit(
      { roomName: data.roomName },
      { method: "post", action: `/ready` }
    );

  if (data.result) {
    return (
      <div>
        <div>Result for {data.roomName}</div>
        <div>Statement:</div>
        <div>{data.result.statement}</div>
        <div
          className="rounded-2xl p-20"
          style={{ backgroundColor: data.result.color }}
        >
          {data.result.color}
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div>Room not ready, refresh in a bit.</div>
        <button
          type="button"
          onClick={ready}
          className="rounded bg-blue-400 p-4"
        >
          READY FOR {data.roomName}
        </button>
      </div>
    );
  }
}
