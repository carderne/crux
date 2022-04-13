import type { ActionFunction } from "@remix-run/node";
import type { FormEvent } from "react";
import { Link, Form, useSubmit, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import { redis } from "~/utils/redis.server";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { room } = Object.fromEntries(body);
  const exists = await redis.get(`${room}:exists`);
  if (exists) {
    return redirect(`/${room}`);
  } else {
    return json({ error: "Room doesn't exist" });
  }
};

export default function Index() {
  const [room, setRoom] = useState("");
  const submit = useSubmit();
  const actionData = useActionData();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit({ room: room.replace(" ", "-") }, { method: "post" });
  };

  return (
    <div className="flex flex-grow flex-col justify-between p-10">
      <div>
        <div className=" text-sm text-red-500">
          <div className={actionData?.error ? "visible" : "invisible"}>
            No such room!
          </div>
        </div>
        <Form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>
              <input
                placeholder="Room name here..."
                className="w-full rounded-xl p-4"
                type="text"
                onChange={(e) => setRoom(e.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-600 p-4 shadow-xl"
          >
            <div className="text-xl text-stone-50">Join room</div>
          </button>
        </Form>
      </div>
      <Link to="/create">
        <div className="mt-auto rounded-xl bg-emerald-600 p-4 shadow-xl">
          <div className="mx-auto text-center text-xl text-stone-50">
            Create room
          </div>
        </div>
      </Link>
    </div>
  );
}
