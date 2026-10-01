export const isAllowedGreenBase = (value: string) => {
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
