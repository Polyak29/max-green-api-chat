# MAX Chat (GREEN-API)

Минимальный веб-чат на React для отправки и получения **текстовых** сообщений в мессенджере **MAX** через [GREEN-API](https://green-api.com/v3/docs/api/).

## Возможности

- Вход по `idInstance`, `apiTokenInstance` и `apiUrl` из личного кабинета GREEN-API
- Создание чата по номеру телефона (`CheckAccount` → сохранение `chatId`)
- Отправка текста (`SendMessage`)
- Получение ответов через HTTP API (`ReceiveNotification` + `DeleteNotification`)
- Интерфейс в духе двухколоночного чата (список диалогов + переписка)
- Сохранение сессии и переписки в `localStorage`

## Требования

- Node.js 20+
- Инстанс **MAX** в GREEN-API в статусе **authorized**
- В настройках инстанса **не должен быть задан webhook URL** (иначе очередь HTTP API недоступна)

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес из терминала (обычно `http://localhost:5173`).

Сборка:

```bash
npm run build
npm run preview
```

## Как пользоваться

1. В [консоли GREEN-API](https://console.green-api.com/) создайте или выберите инстанс MAX и авторизуйте его (QR / 2FA).
2. Скопируйте `idInstance`, `apiTokenInstance` и `apiUrl`.
3. Войдите в приложение и создайте чат по номеру (11 цифр для РФ `7…`, 12 для РБ `375…`).
4. Отправьте сообщение. Ответ собеседника из MAX появится в чате после получения уведомления.

## Стек

- Vite, React, TypeScript
- Tailwind CSS
- shadcn/ui (формы и диалоги)
- Sonner (уведомления)

## Структура

- `src/lib/green-api.ts` — клиент GREEN-API
- `src/features/auth/login-screen.tsx` — экран входа
- `src/features/chat/` — чат, polling, UI
- `src/features/chat/use-notifications.ts` — long polling входящих сообщений

В режиме разработки запросы к `https://api.greenapi.com` проксируются через Vite (`/green-api`), чтобы обойти ограничения CORS в браузере.

## Безопасность

Не коммитьте токены инстанса. Для проверки используйте тестовый инстанс GREEN-API.
