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

const test_pair = async (statements: string, people: string[]) => {
  try {
    const room = "fake-room";
    await redis.set(`${room}:statements`, statements);
    await redis.hset(`${room}:people`, ...people);
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
    return pairings;
  } finally {
    await redis.flushall();
  }
};

test("pair with even number", async () => {
  const statements = `["foo", "bar", "baz"]`;
  const people = ["aaaaaa", "[1, 2, 3]", "bbbbbb", "[5, 5, 5]"];
  const pairings = await test_pair(statements, people);
  expect(pairings.aaaaaa.statement).toEqual(pairings.bbbbbb.statement);
});

test("pair with odd number", async () => {
  const statements = `["foo", "bar", "baz"]`;
  const people = [
    "aaaaaa",
    "[1, 2, 3]",
    "bbbbbb",
    "[5, 5, 5]",
    "cccccc",
    "[3, 3, 3]",
  ];
  const pairings = await test_pair(statements, people);
  expect(pairings.aaaaaa.statement).toEqual(pairings.bbbbbb.statement);
});
