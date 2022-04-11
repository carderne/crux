import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";

const adjectives = ["old", "sad", "happy", "tall"];
const animals = ["rhino", "elephant", "cat", "dolphin"];

const random = (arr: Array<string>) =>
  arr[Math.floor(Math.random() * arr.length)];

export const loader: LoaderFunction = async () => {
  return json({ name: `${random(adjectives)}-${random(animals)}` });
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { roomName, ...statementsObj } = Object.fromEntries(body);
  const statements = Object.values(statementsObj);
  return redirect(`/room/holy-cow`);
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
    <div>
      <div className="rounded bg-blue-100 p-10">
        <div>Questions</div>
        <Form reloadDocument method="post">
          <div className="m-2">
            <fieldset>
              <div className="hidden">
                <input name="name" value={data.name} readOnly />
              </div>
              {statements.map((s: string, i: number) => (
                <label key={i}>
                  <div className="my-2">
                    <input
                      name={i.toString()}
                      placeholder="Your statement here..."
                      className="w-full"
                      type="text"
                    />
                  </div>
                </label>
              ))}
            </fieldset>
          </div>
          <div className="flex flex-row">
            <button
              type="button"
              onClick={addStatement}
              className="m-2 rounded bg-green-300 p-2"
            >
              +
            </button>
            <button
              type="button"
              onClick={removeStatement}
              className="m-2 rounded bg-red-300 p-2"
            >
              -
            </button>
          </div>
          <button type="submit" className="rounded bg-blue-400 p-4">
            Create room {data.name}
          </button>
        </Form>
      </div>
    </div>
  );
}
