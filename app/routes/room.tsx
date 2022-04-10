import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const one = url.searchParams.get("one");
  const two = url.searchParams.get("two");
  return json({
    one: one,
    two: two,
    questions: [
      { id: "1", name: "Pants" },
      { id: "2", name: "Jacket" },
    ],
  });
};

export default function Products() {
  const data = useLoaderData();
  return (
    <div>
      <h1>Questions</h1>
      <div className="text-2xl">
        <div>{data.one}</div>
        <div>{data.two}</div>
      </div>
      {data.questions.map((q) => (
        <div key={q.id}>{q.name}</div>
      ))}
    </div>
  );
}
