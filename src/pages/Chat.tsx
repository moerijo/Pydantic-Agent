import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { useToast } from "@/components/ui/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface Message {
  session_id: string;
  message: {
    content: string;
    type: 'human' | 'ai';
  };
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [currentSession, setCurrentSession] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        if (payload.new.session_id === currentSession) {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentSession]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('session_id, message')
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch sessions",
          variant: "destructive",
        });
        return;
      }

      const uniqueSessions = data.reduce((acc, curr) => {
        if (!acc.find(s => s.id === curr.session_id)) {
          const firstMessage = curr.message.content;
          acc.push({
            id: curr.session_id,
            title: firstMessage.slice(0, 100),
          });
        }
        return acc;
      }, []);

      setSessions(uniqueSessions);
    };

    fetchSessions();
  }, []);

  const handleSend = async (message: string) => {
    const sessionId = currentSession || uuidv4();
    if (!currentSession) setCurrentSession(sessionId);
    
    setLoading(true);
    try {
      // Send message to FastAPI
      const response = await fetch('http://localhost:8001/api/pydantic-github-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          user_id: 'NA',
          request_id: uuidv4(),
          session_id: sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Message will be added through the subscription
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-chat-dark text-chat-text">
        <Sidebar className="bg-chat-light border-r border-chat-accent">
          <SidebarContent>
            <div className="p-4 space-y-4">
              <button
                onClick={() => setCurrentSession('')}
                className="w-full px-4 py-2 text-left hover:bg-chat-dark rounded-lg transition-colors"
              >
                New Chat
              </button>
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSession(session.id)}
                  className={`w-full px-4 py-2 text-left hover:bg-chat-dark rounded-lg transition-colors ${
                    currentSession === session.id ? 'bg-chat-dark' : ''
                  }`}
                >
                  {session.title}
                </button>
              ))}
            </div>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>
        
        <SidebarTrigger />
      </div>
    </SidebarProvider>
  );
};

export default Chat;