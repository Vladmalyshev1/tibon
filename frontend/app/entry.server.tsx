import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { renderToPipeableStream } from "react-dom/server";
import { redirect, ServerRouter } from "react-router";
import type { EntryContext } from "react-router";
import { informationPages, requestAction, servicePages } from "./data/business";

const ABORT_DELAY = 5_000;
const canonicalPaths = new Map([
  ...Object.values(servicePages).map(({ path }) => [path.slice(0, -1), path] as const),
  ...[informationPages.contact.path, requestAction.to, "/o-studii/", "/politika-konfidencialnosti/"].map(
    path => [path.slice(0, -1), path] as const,
  ),
  ["/kontakty", informationPages.contact.path],
]);

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  // Normalize document requests here, before streaming HTML. Router data requests have their own URL format.
  const url = new URL(request.url);
  const canonical = canonicalPaths.get(url.pathname.toLowerCase().replace(/\/+$/, ""));
  if (canonical && canonical !== url.pathname) return redirect(`${canonical}${url.search}`, 308);

  return new Promise<Response>((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onShellReady() {
          shellRendered = true;
          responseHeaders.set("Content-Type", "text/html; charset=utf-8");
          const body = new PassThrough();
          resolve(new Response(createReadableStreamFromReadable(body), {
            headers: responseHeaders,
            status: responseStatusCode,
          }));
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          if (shellRendered) console.error(error);
          responseStatusCode = 500;
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
