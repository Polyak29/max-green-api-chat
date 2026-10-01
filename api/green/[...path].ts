import { isAllowedGreenBase } from "../allowed-host";

type ProxyRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query: Record<string, string | string[] | undefined>;
};

type ProxyResponse = {
  status: (code: number) => ProxyResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
};

const headerValue = (
  headers: ProxyRequest["headers"],
  name: string,
) => {
  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

const handler = async (request: ProxyRequest, response: ProxyResponse) => {
  const base = headerValue(request.headers, "x-green-base")?.replace(/\/+$/, "");

  if (!base || !isAllowedGreenBase(base)) {
    response.status(400).send("Недопустимый адрес GREEN-API");
    return;
  }

  const segments = request.query.path;
  const path = Array.isArray(segments) ? segments.join("/") : segments ?? "";
  const incoming = new URL(request.url ?? "/", "http://localhost");
  const target = new URL(`${base}/${path}`);
  target.search = incoming.search;

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstream = await fetch(target, {
    method: request.method,
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    body: hasBody && request.body !== undefined ? JSON.stringify(request.body) : undefined,
  });

  const text = await upstream.text();
  response.status(upstream.status);
  response.setHeader(
    "Content-Type",
    upstream.headers.get("content-type") ?? "application/json",
  );
  response.send(text);
};

export default handler;
