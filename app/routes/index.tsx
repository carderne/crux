import { Link, Form } from "@remix-run/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate(`/${room}`);
  };

  return (
    <div className="flex flex-grow flex-col justify-between p-10">
      <div className="rounded">
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
