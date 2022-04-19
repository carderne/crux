import { parseCookie, getId } from "./utils.server";

test("parseCookie works", () => {
  expect(parseCookie("id=1234;foo=bar")["id"]).toBe("1234");
});

test("getId works", () => {
  const headers = {
    cookie: "id=abcabc;foo=bar",
    get: function (key: string) {
      return this.cookie;
    },
  };
  const request = { headers };
  // @ts-ignore: this is mocked
  expect(getId(request)).toHaveLength(6);
});
