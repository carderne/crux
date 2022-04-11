import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { redis } from "~/utils/redis.server";
import { useLocation } from "react-router-dom";

export const loader: LoaderFunction = async ({ params }) => {
  const roomName = params.roomName;
  const questions = await redis
    .get(`${roomName}.statements`)
    .then((res) => JSON.parse(res));
  return json({
    roomName,
    questions,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { roomName, ...ratings } = Object.fromEntries(body);
  await redis.rpush(
    `${roomName}.ratings`,
    JSON.stringify(Object.values(ratings))
  );
  return null;
};

export default function Room() {
  const location = useLocation();
  const data = useLoaderData();
  return (
    <div>
      <h1>Questions for {data.roomName}</h1>
      <a
        className="text-blue-600"
        href={`http://localhost:3000${location.pathname}`}
      >
        Shareable URL
      </a>
      <Form reloadDocument method="post">
        <div className="rounded bg-blue-200 p-4">
          <fieldset>
            <div className="hidden">
              <input name="roomName" value={data.roomName} readOnly />
            </div>
            {data.questions.map((q, i) => (
              <div className="m-2 bg-red-400 p-2" key={i}>
                <label>
                  <div>{q}</div>
                  <input
                    name={i.toString()}
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                  />
                </label>
              </div>
            ))}
          </fieldset>
          <button type="submit" className="rounded bg-blue-400 p-4">
            Submit answers
          </button>
        </div>
      </Form>
    </div>
  );
}
