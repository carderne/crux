import { calculate, action } from "./pair";
import { redis } from "~/utils/redis.server";

test("calculate pairs", () => {
  const pairings = calculate(["foo", "bar", "baz"], {
    A: [1, 3, 3],
    B: [5, 3, 3],
    C: [3, 3, 5],
    D: [3, 3, 1],
  });
  expect(pairings).toHaveProperty("A");
  expect(pairings.A.statement).toEqual("foo");
  expect(pairings.A).toEqual(pairings.B);
});

test("pair route", async () => {
  try {
    const room = "fake-room";
    await redis.set(`${room}:statements`, `["foo", "bar", "baz"]`);
    await redis.hset(`${room}:ratings`, "A", "[1, 2, 3]", "B", "[5, 5, 5]");
    const request = {
      formData: function () {
        return [["room", room]];
      },
    };
    // @ts-ignore: this is mocked
    await action({ request });
    const pairings = await redis
      .get(`${room}:pairings`)
      .then((r: any) => JSON.parse(r));
    expect(pairings.A.statement).toEqual(pairings.B.statement);
  } finally {
    await redis.flushall();
  }
});
