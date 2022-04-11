import { Link, Form } from "@remix-run/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate(`room/${roomName}`);
  };

  return (
    <div className="flex h-screen w-screen flex-col justify-evenly p-10">
      <div className="text-5xl">Crux</div>
      <Link to="/create">
        <div className="rounded bg-blue-400 p-4">Create room</div>
      </Link>
      <div className="rounded bg-blue-100 p-10">
        <Form onSubmit={handleSubmit}>
          <div className="m-2">
            <label>
              <input
                placeholder="jaded-monkey"
                className="w-full"
                type="text"
                onChange={(e) => setRoomName(e.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="rounded bg-blue-400 p-4">
            Join room
          </button>
        </Form>
      </div>
    </div>
  );
}
