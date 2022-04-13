import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { redis, redisHSet } from "~/utils/redis.server";
import { getId, cookieHeader } from "~/utils/utils";


export const loader: LoaderFunction = async ({ params, request }) => {
  const room = params.room;
  const exists = await redis.get(`${room}:exists`);
  if (exists) {
    const statements = await redis
      .get(`${room}:statements`)
      .then((res) => JSON.parse(res));
    const id = getId(request);

    return json(
      { room, statements },
      { headers: { "Set-Cookie": cookieHeader(id) } }
    );
  } else {
    return redirect("/");
  }
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const id = getId(request);
  const { room, ...ratingsObj } = Object.fromEntries(body);

  const ratings = JSON.stringify(
    Object.values(ratingsObj).map((r) => parseInt(r))
  );
  await redisHSet(`${room}:ratings`, id, ratings);

  return redirect(`/${room}/pair`);
};

export default function Room() {
  const data = useLoaderData();
  const hasStatements = data.statements !== null;
  const roomShout = data.room.replace("-", " ");
  const refresh = () => window.location.reload();
  const copyURL = () =>
    navigator.clipboard.writeText(`https://crux.rdrn.me/${data.room}`);

  return (
    <div className="flex flex-grow flex-col p-10">
      <div className="flex">
        <div className="mr-4 flex flex-col">
          <div className="text-xs">Shout this</div>
          <div className="rounded-xl bg-white p-4">{roomShout}</div>
        </div>
        <div className="ml-auto flex flex-col">
          <div className="ml-auto text-xs">Or click this</div>
          <button
            type="button"
            className="mx-auto w-max rounded-xl rounded-xl bg-cyan-600 p-4 shadow"
            onClick={copyURL}
          >
            <div className="text-stone-50">copy URL</div>
          </button>
        </div>
      </div>
      {hasStatements && (
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
      )}
      {!hasStatements && (
        <div className="flex flex-grow flex-col justify-between">
          <div className="mt-10 text-center text-xl">
            <div>🤔</div>
            <div>Statements not ready yet...</div>
            <div>(try refreshing in a little while)</div>
          </div>
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
