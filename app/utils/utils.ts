import { customAlphabet } from "nanoid";

type cookieObject = { [name: string]: string };

export const parseCookie = (str: string | null | undefined): cookieObject => {
  if (!str)
    return {};
  return !str ? {} : str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc: cookieObject, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
};

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 6);

export const cookieHeader = (id: string) => `id=${id}; Secure; Max-Age=3600; Path=/`;

export const getId = (request: Request) => {
  try {
    const cookie = request.headers.get("cookie")?.toString();
    return parseCookie(cookie)["id"];
  } catch (err) {
    return nanoid();
  }
};
