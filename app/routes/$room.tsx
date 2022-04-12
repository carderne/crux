import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { redis } from "~/utils/redis.server";
import { useLocation } from "react-router-dom";
import { parseCookie } from "~/utils/utils";
import { nanoid } from "~/utils/utils";

const getId = (request) => {
 try {
  const cookie = request.headers.get("cookie");
  return parseCookie(cookie)["id"];
 } catch (err) {
  return nanoid();
 }
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const room = params.room;
  const statements = await redis
    .get(`${room}.statements`)
    .then((res) => JSON.parse(res));
  const id = getId(request);

  if (statements?.length > 0) {
    return json(
      {
        room,
        statements,
      },
      {
        headers: { "Set-Cookie": `id=${id}; Max-Age=3600` },
      }
    );
  } else {
    return redirect("/");
  }
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const cookie = request.headers.get("cookie");
  const id = parseCookie(cookie)["id"];
  const { room, ...ratings } = Object.fromEntries(body);
  await redis.hset(
    `${room}.ratings`,
    id,
    JSON.stringify(Object.values(ratings).map((r) => parseInt(r)))
  );
  return redirect(`/${room}/pair`);
};

export default function Room() {
  const location = useLocation();
  const data = useLoaderData();
  return (
    <div className="flex flex-grow flex-col p-10">
      <div className="w-full rounded-xl bg-white p-4">
        {`http://localhost:3000${location.pathname}`}
      </div>
      <Form reloadDocument method="post" className="h-full">
        <div className="flex h-full flex-col justify-between">
          <fieldset>
            <div className="hidden">
              <input name="room" value={data.room} readOnly />
            </div>
            {data.statements.map((q, i) => (
              <div
                className="my-4 border-b-2 border-stone-600 p-4 last:border-b-0"
                key={i}
              >
                <label>
                  <div className="italic">"{q}"</div>
                  <select
                    name={i.toString()}
                    className="ml-auto block rounded-xl p-2"
                    defaultValue={3}
                  >
                    <option value={1}>Hard no</option>
                    <option value={2}>Prob not</option>
                    <option value={3}>Unsure</option>
                    <option value={4}>Guess so</option>
                    <option value={5}>Heck yeah</option>
                  </select>
                </label>
              </div>
            ))}
          </fieldset>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 p-4 shadow-xl"
          >
            <div className="text-xl text-stone-50">Submit</div>
          </button>
        </div>
      </Form>
    </div>
  );
}
