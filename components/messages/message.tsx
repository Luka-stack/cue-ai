import { Message as MessageType } from '@/models';
import { AiMessage } from './ai-message';
import { ErrorMessage } from './error-message';
import { ProposalMessage } from './proposal-message';
import { UserMessage } from './user-message';

export function Message({ message }: { message: MessageType }) {
  switch (message.type) {
    case 'ai':
      return <AiMessage message={message} />;
    case 'user':
      return <UserMessage message={message} />;
    case 'proposal':
      return <ProposalMessage message={message} />;
    case 'error':
      return <ErrorMessage message={message} />;
    default:
      return null;
  }
}
