import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { redis } from "~/utils/redis.server";
import { nanoid } from "nanoid";

const adjectives = ["old", "sad", "happy", "tall"];
const animals = ["rhino", "elephant", "cat", "dolphin"];

const random = (arr: Array<string>) =>
  arr[Math.floor(Math.random() * arr.length)];

export const loader: LoaderFunction = async () => {
  return json({ room: `${random(adjectives)}-${random(animals)}` });
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { room, ...statements } = Object.fromEntries(body);
  const id = nanoid();
  await redis.set(
    `${room}.statements`,
    JSON.stringify(Object.values(statements))
  );
  await redis.set(`${room}.admin`, id);
  return redirect(`/${room}`, {
    headers: { "Set-Cookie": `id=${id}; Max-Age=3600` },
  });
};

export default function Create() {
  const data = useLoaderData();
  const [statements, setStatements] = useState([""]);
  const addStatement = () => {
    setStatements(statements.concat([""]));
  };
  const removeStatement = () => {
    setStatements(statements.slice(0, -1));
  };

  return (
    <div className="flex-grow p-10">
      <Form reloadDocument method="post" className="h-full">
        <div className="flex h-full flex-col justify-between">
          <div>
            <fieldset>
              <div className="hidden">
                <input name="room" value={data.room} readOnly />
              </div>
              {statements.map((s: string, i: number) => (
                <label key={i}>
                  <div className="mb-2">
                    <input
                      name={i.toString()}
                      placeholder="Your statement here..."
                      className="w-full rounded-xl p-4"
                      type="text"
                    />
                  </div>
                </label>
              ))}
            </fieldset>
            <div className="my-4 ml-auto flex flex-row">
              <button
                type="button"
                onClick={addStatement}
                className="ml-auto w-14 rounded bg-green-700 p-2 text-stone-50"
              >
                add
              </button>
              <button
                type="button"
                onClick={removeStatement}
                className="ml-4 w-14 rounded bg-red-700 p-2 text-stone-50"
              >
                del
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 p-4 shadow-xl"
          >
            <div className="text-xl text-stone-50">Create</div>
          </button>
        </div>
      </Form>
    </div>
  );
}
