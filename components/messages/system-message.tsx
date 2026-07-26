import { View } from 'react-native';

import type { SystemMessage, ToDo } from '../../models';
import { Button } from '../ui/button';
import { Text } from '../ui/text';

function ToDoMessage({ message }: { message: SystemMessage<ToDo> }) {
  return (
    <View className="flex rounded-2xl bg-card shadow shadow-black/5 border-l-4 border-[#1F84E4] p-4 mt-4">
      <Text className="text-muted-foreground mb-5">{message.content}</Text>

      <View className="flex-row items-center mb-2 ml-1 justify-between">
        <Text className="bg-[#1F84E41A] text-[#1F84E4] px-3 text-[14px] rounded-sm py-px">
          To-Do
        </Text>

        <Text className="text-[14px] text-muted-foreground">
          {message.item.date
            ? new Date(message.item.date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })
            : 'No date available'}
        </Text>
      </View>

      <Text className="text-lg font-semibold">{message.item.title}</Text>

      {message.item.content ? <Text>{message.item.content}</Text> : null}

      <Button className="bg-[#1F84E4] mt-5">
        <Text className="font-semibold text-lg">Add to timeline</Text>
      </Button>
    </View>
  );
}

function NoteMessage({ message }: { message: SystemMessage }) {
  return (
    <View className="flex rounded-2xl bg-card shadow shadow-black/5 border-l-4 border-[#EF4E5B] p-4 mt-4">
      <Text className="text-muted-foreground mb-3">{message.content}</Text>

      <View className="flex-row items-start mb-2 ml-1">
        <Text className="bg-[#EF4E5B1A] text-[#EF4E5B] px-3 text-[14px] rounded-sm py-px">
          Note
        </Text>
      </View>

      <Text className="text-lg font-semibold">{message.item.title}</Text>

      {message.item.content ? <Text>{message.item.content}</Text> : null}

      <Button className="bg-[#EF4E5B] mt-5">
        <Text className="font-semibold text-lg">Save note</Text>
      </Button>
    </View>
  );
}

export function SystemMessage({ message }: { message: SystemMessage<any> }) {
  if (message.item.type === 'todo') {
    return <ToDoMessage message={message} />;
  }

  if (message.item.type === 'note') {
    return <NoteMessage message={message} />;
  }

  return null;
}
