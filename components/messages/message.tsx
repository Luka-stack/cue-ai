import { Message as MessageType } from '@/models';
import { AiMessage } from './ai-message';
import { SystemMessage } from './system-message';
import { UserMessage } from './user-message';

export function Message({ message }: { message: MessageType }) {
  if (message.type === 'ai') {
    return <AiMessage message={message} />;
  }

  if (message.type === 'user') {
    return <UserMessage message={message} />;
  }

  if (message.type === 'system') {
    return <SystemMessage message={message} />;
  }

  return null;
}
