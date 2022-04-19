import { customAlphabet } from "nanoid";

type cookieObject = { [name: string]: string };

export const parseCookie = (str: string): cookieObject => {
  return str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc: cookieObject, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
};

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 6);

export const cookieHeader = (id: string) => `id=${id}; Max-Age=3600; Path=/`;

export const cookieId = (request: Request): string | null => {
  const cookieStr = request.headers.get("cookie");
  if (typeof cookieStr === "string") {
    const cookies = parseCookie(cookieStr);
    if ("id" in cookies) {
      return cookies["id"];
    }
  }
  return null;
};

export const getId = (request: Request): string => {
  const id = cookieId(request);
  if (id !== null) return id;
  return nanoid();
};
