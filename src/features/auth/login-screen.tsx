import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatContext } from "@/features/chat/chat-context";
import {
  getStateInstance,
  GreenApiError,
  instanceStateLabel,
  normalizeApiUrl,
} from "@/lib/green-api";
import type { GreenApiCredentials } from "@/lib/types";

export const LoginScreen = () => {
  const { setCredentials } = useChatContext();
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [apiUrl, setApiUrl] = useState("https://api.greenapi.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    const credentials: GreenApiCredentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: normalizeApiUrl(apiUrl),
    };

    if (!credentials.idInstance || !credentials.apiTokenInstance) {
      setError("Укажите idInstance и apiTokenInstance из личного кабинета GREEN-API.");

      return;
    }

    setIsSubmitting(true);

    try {
      const state = await getStateInstance(credentials);

      if (state.stateInstance !== "authorized") {
        setError(
          `Инстанс не готов к работе: ${instanceStateLabel[state.stateInstance] ?? state.stateInstance}. Авторизуйте MAX в кабинете GREEN-API (QR или 2FA).`,
        );

        return;
      }

      setCredentials(credentials);

      toast.success("Подключение к GREEN-API установлено");
    } catch (submitError) {
      const message =
        submitError instanceof GreenApiError
          ? submitError.message
          : "Не удалось проверить инстанс. Проверьте данные и apiUrl.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
            M
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">MAX Chat</h1>
          <p className="text-sm text-muted-foreground">
            Введите данные инстанса GREEN-API для отправки и получения текстовых
            сообщений в мессенджере MAX.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="idInstance">idInstance</Label>
            <Input
              id="idInstance"
              inputMode="numeric"
              placeholder="1100000000"
              value={idInstance}
              onChange={(event) => setIdInstance(event.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiTokenInstance">apiTokenInstance</Label>
            <Input
              id="apiTokenInstance"
              type="password"
              placeholder="Токен инстанса"
              value={apiTokenInstance}
              onChange={(event) => setApiTokenInstance(event.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiUrl">apiUrl</Label>
            <Input
              id="apiUrl"
              placeholder="https://api.greenapi.com"
              value={apiUrl}
              onChange={(event) => setApiUrl(event.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Берите значение из консоли GREEN-API для вашего инстанса.
            </p>
          </div>

          {error ? (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Проверяем инстанс…" : "Войти в чат"}
          </Button>
        </form>
      </div>
    </div>
  );
};
