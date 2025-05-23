import MessageTest from "../../components/MessageTest";
import LoginButton from "../../components/LoginButton";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center gap-6 h-screen">
      <LoginButton />
      <MessageTest />
    </main>
  );
} 