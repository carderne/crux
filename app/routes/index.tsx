import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="flex h-screen w-screen flex-col justify-evenly p-10">
      <div className="text-5xl">Crux</div>
      <div className="rounded bg-blue-400 p-4">
        <Link to="/create">Create room</Link>
      </div>
      <div className="rounded bg-blue-100 p-10">
        <form method="get" action="/room">
          <fieldset>
            <div className="my-2">
              <label>
                <input name="one" type="text" />
              </label>
            </div>
            <div className="my-2">
              <label>
                <input name="two" type="text" />
              </label>
            </div>
            <button type="submit" className="rounded bg-blue-400 p-4">
                Join room
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
