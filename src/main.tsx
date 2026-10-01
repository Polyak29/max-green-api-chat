import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import App from "@/App";
import { ChatProvider } from "@/features/chat/chat-context";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChatProvider>
      <App />
      <Toaster richColors position="top-center" />
    </ChatProvider>
  </StrictMode>,
);
