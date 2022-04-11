import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { redis } from "~/utils/redis.server";

export const loader: LoaderFunction = async ({ params }) => {
  const roomName = params.roomName;
  const questions = await redis
    .get(`${roomName}.questions`)
    .then((res) => JSON.parse(res));
  return json({
    roomName,
    questions,
  });
};

export default function Room() {
  const data = useLoaderData();
  return (
    <div>
      <h1>Questions for {data.roomName}</h1>
      <div className="rounded bg-blue-200 p-4">
        {data.questions.map((q, i) => (
          <div className="m-2 bg-red-400 p-2" key={i}>
            <label>
              <div>{q}</div>
              <input type="range" min="1" max="5" step="1" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
