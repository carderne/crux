import { parseCookie, getId } from "./utils";

test("parseCookie works", () => {
  expect(parseCookie("id=1234;foo=bar")["id"]).toBe("1234");
});

test("getId falls back gracefully", () => {
  expect(getId()).toHaveLength(6);
  const headers = {
    cookie: "id=abcabc;foo=bar",
    get: function (key) {
      return this[key];
    },
  };
  const request = { headers };
  expect(getId(request)).toHaveLength(6);
});
