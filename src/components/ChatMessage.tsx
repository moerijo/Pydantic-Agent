import { ReactMarkdown } from 'react-markdown';

interface Message {
  message: {
    content: string;
    type: 'human' | 'ai';
  };
}

export const ChatMessage = ({ message }: { message: Message }) => {
  const isAI = message.message.type === 'ai';
  
  return (
    <div className={`py-4 ${isAI ? 'bg-chat-light' : 'bg-chat-dark'} animate-fade-in`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-start gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isAI ? 'bg-blue-600' : 'bg-chat-accent'
          }`}>
            {isAI ? '🤖' : '👤'}
          </div>
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-chat-muted">
              {isAI ? 'AI Assistant' : 'You'}
            </div>
            <div className="text-chat-text prose prose-invert max-w-none">
              {isAI ? (
                <ReactMarkdown>{message.message.content}</ReactMarkdown>
              ) : (
                <p>{message.message.content}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};