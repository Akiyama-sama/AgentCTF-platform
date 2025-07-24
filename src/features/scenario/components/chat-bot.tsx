import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { SendHorizonal } from "lucide-react";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ChatBotProps = {
  className?: string;
};

export function ChatBot({ className }: ChatBotProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card className={cn("flex h-full w-full flex-col", className)}>
      <CardContent className="flex-1 p-4">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                开始与 Attacker Agent 对话
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role !== "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>我</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="与智能体对话..."
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">发送</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
