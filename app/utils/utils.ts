import { customAlphabet } from "nanoid";

export const parseCookie = (str) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz");

export const cookieHeader = (id) => `id=${id}; Secure; Max-Age=3600; Path=/`;

export const getId = (request) => {
  try {
    const cookie = request.headers.get("cookie");
    return parseCookie(cookie)["id"];
  } catch (err) {
    return nanoid();
  }
};
