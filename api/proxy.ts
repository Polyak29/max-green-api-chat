type ProxyRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
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

const isAllowedGreenBase = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname;

    return (
      url.protocol === "https:" &&
      (host === "api.greenapi.com" ||
        host === "api.green-api.com" ||
        host.endsWith(".green-api.com"))
    );
  } catch {
    return false;
  }
};

const handler = async (request: ProxyRequest, response: ProxyResponse) => {
  const base = headerValue(request.headers, "x-green-base")?.replace(/\/+$/, "");
  const greenPath = headerValue(request.headers, "x-green-path") ?? "";

  if (!base || !isAllowedGreenBase(base)) {
    response.status(400).send("Недопустимый адрес GREEN-API");
    return;
  }

  if (!greenPath.startsWith("/waInstance") || greenPath.includes("..")) {
    response.status(400).send("Недопустимый путь GREEN-API");
    return;
  }

  const target = new URL(`${base}${greenPath}`);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstream = await fetch(target, {
    method: request.method,
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    body:
      hasBody && request.body !== undefined
        ? JSON.stringify(request.body)
        : undefined,
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
