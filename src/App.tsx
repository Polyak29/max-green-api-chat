import { LoginScreen } from "@/features/auth/login-screen";
import { ChatScreen } from "@/features/chat/chat-screen";
import { useChatContext } from "@/features/chat/chat-context";

const App = () => {
  const { credentials } = useChatContext();

  if (!credentials) {
    return <LoginScreen />;
  }

  return <ChatScreen />;
};

export default App;
