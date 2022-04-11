import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ params }) => {
  return json({
    name: params.roomId,
    questions: [
      { id: "1", name: "Pants" },
      { id: "2", name: "Jacket" },
    ],
  });
};

export default function Room() {
  const data = useLoaderData();
  return (
    <div>
      <h1>Questions</h1>
      <div className="text-2xl">
        <div>{data.name}</div>
      </div>
      {data.questions.map((q) => (
        <div key={q.id}>{q.name}</div>
      ))}
    </div>
  );
}
