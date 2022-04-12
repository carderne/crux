import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useCatch,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Crux",
  viewport: "width=device-width,initial-scale=1",
});

const Header = () => {
  return (
    <Link to="/">
      <div className="flex">
        <h1 className="py-4 px-4 text-xl text-cyan-600">Home</h1>
      </div>
    </Link>
  );
};

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html>
      <head>
        <title>404</title>
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col h-screen w-screen">
        <Header />
        <div className="m-auto text-3xl text-center w-full italic">
        <h1>
          Sorry, that's a {caught.status}
        </h1>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex h-screen w-screen flex-col bg-stone-100 pb-20">
        <Header />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
