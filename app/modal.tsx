import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useUserId } from '@/contexts/user-context';
import { errorMessage, itemsApi } from '@/lib/api';
import { CalendarDays, Check, Clock, X } from '@/lib/icons';
import { cn } from '@/lib/utils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardProvider,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';

type WithDatetime = {
  date: Date | null;
  show: boolean;
  switch: boolean;
};

export default function ModalScreen() {
  const router = useRouter();
  const userId = useUserId();
  const [saving, setSaving] = useState(false);

  // TAB TODO
  const [withDate, setWithDate] = useState<WithDatetime>({
    date: null,
    show: false,
    switch: false,
  });

  const [withTime, setWithTime] = useState<WithDatetime>({
    date: null,
    show: false,
    switch: false,
  });

  const [todoTitle, setTodoTitle] = useState('');
  const [todoNote, setTodoNote] = useState('');

  const canSaveTodo = todoTitle?.trim().length > 0 && !saving;

  const handleSaveTodo = async () => {
    if (!canSaveTodo) return;

    // Only send a date when the user picked one; the server stores it in UTC.
    let date: string | undefined;
    if (withDate.date || withTime.date) {
      const value = new Date();
      value.setSeconds(0, 0);

      if (withDate.date) {
        value.setFullYear(
          withDate.date.getFullYear(),
          withDate.date.getMonth(),
          withDate.date.getDate(),
        );
      }

      if (withTime.date) {
        value.setHours(withTime.date.getHours(), withTime.date.getMinutes());
      }
      date = value.toISOString();
    }

    await save({
      type: 'todo',
      title: todoTitle.trim(),
      content: todoNote.trim() || undefined,
      date,
    });
  };

  // TAB NOTE
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const canSaveNote =
    (noteTitle?.trim().length > 0 || noteContent?.trim().length > 0) && !saving;

  const handleSaveNote = async () => {
    if (!canSaveNote) return;
    await save({
      type: 'note',
      title: noteTitle.trim() || undefined,
      content: noteContent.trim() || undefined,
    });
  };

  // GLOBAL
  const [tab, setTab] = useState('TODO');

  const canSave = tab === 'TODO' ? canSaveTodo : canSaveNote;

  const handleSave = tab === 'TODO' ? handleSaveTodo : handleSaveNote;

  const save = async (payload: Parameters<typeof itemsApi.create>[1]) => {
    setSaving(true);

    try {
      await itemsApi.create(userId, payload);
      router.dismiss();
    } catch (error) {
      Alert.alert('Could not save', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardProvider>
      <KeyboardAwareScrollView className="flex-1 bg-slate-200 px-3 pt-3">
        <Tabs value={tab} onValueChange={(value) => setTab(value)}>
          <View className="flex flex-row items-center justify-between">
            <Button
              onPress={() => router.dismiss()}
              variant="outline"
              className="rounded-full size-10 bg-slate-100 border-slate-100"
            >
              <X size={24} className="text-slate-600" />
            </Button>

            <Button
              onPress={handleSave}
              className={cn(
                'rounded-full size-10 bg-slate-100 border-slate-100',
                !canSave && 'shadow-none',
              )}
              disabled={!canSave}
              variant="outline"
            >
              <Check size={24} className="text-slate-600" />
            </Button>
          </View>

          <TabsList className="bg-slate-300 w-full mt-2 mb-4">
            <TabsTrigger value="TODO" className="w-1/2">
              <Text>To-do</Text>
            </TabsTrigger>

            <TabsTrigger value="NOTE" className="w-1/2">
              <Text>Note</Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="TODO">
            <View className="p-2 bg-slate-50 rounded-2xl shadow-sm shadow-black/50 mb-5">
              <Textarea
                value={todoTitle}
                onChangeText={setTodoTitle}
                placeholder="Title"
                numberOfLines={2}
                className="text-lg"
              />
              <Textarea
                value={todoNote}
                onChangeText={setTodoNote}
                placeholder="Note"
                numberOfLines={4}
                className="text-base"
              />
            </View>

            <View>
              <Text className="text-lg text-muted-foreground font-semibold ml-3 mb-1">
                Date & Time
              </Text>

              <View className="p-2 bg-slate-50 rounded-2xl shadow-sm shadow-black/50 gap-4">
                <View className="px-1 flex flex-row items-center gap-5">
                  <CalendarDays
                    size={20}
                    className="text-slate-400"
                    strokeWidth={2}
                  />
                  <View className="flex justify-center">
                    <Label nativeID="with-date" htmlFor="with-date">
                      Date
                    </Label>
                    {withDate.date ? (
                      <Text className="text-blue-500 text-xs">
                        {withDate.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    ) : null}
                  </View>
                  <View className="ml-auto">
                    <Switch
                      id="with-date"
                      nativeID="with-date"
                      checked={withDate.switch}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setWithDate((prev) => ({
                            ...prev,
                            switch: true,
                            show: true,
                          }));
                        } else {
                          setWithDate((prev) => ({
                            ...prev,
                            switch: false,
                            show: false,
                            date: null,
                          }));
                        }
                      }}
                    />
                  </View>
                </View>

                <View className="h-px bg-slate-300 w-[88%] ml-auto" />

                <View className="px-1 flex flex-row items-center gap-5">
                  <Clock size={20} className="text-slate-400" strokeWidth={2} />
                  <View className="flex justify-center">
                    <Label nativeID="with-time" htmlFor="with-time">
                      Time
                    </Label>
                    {withTime.date ? (
                      <Text className="text-blue-500 text-xs">
                        {withTime.date.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    ) : null}
                  </View>
                  <View className="ml-auto">
                    <Switch
                      id="with-time"
                      nativeID="with-time"
                      checked={withTime.switch}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setWithTime((prev) => ({
                            ...prev,
                            switch: true,
                            show: true,
                          }));
                        } else {
                          setWithTime((prev) => ({
                            ...prev,
                            switch: false,
                            show: false,
                            date: null,
                          }));
                        }
                      }}
                    />
                  </View>
                </View>

                {withDate.show ? (
                  <DateTimePicker
                    mode={'date'}
                    value={withDate.date || new Date()}
                    onValueChange={(_event, selectedDate) =>
                      setWithDate((prev) => ({
                        ...prev,
                        show: false,
                        date: selectedDate,
                      }))
                    }
                    onDismiss={() =>
                      setWithDate({
                        switch: false,
                        show: false,
                        date: null,
                      })
                    }
                  />
                ) : null}

                {withTime.show ? (
                  <DateTimePicker
                    mode={'time'}
                    value={withTime.date || new Date()}
                    onValueChange={(_event, selectedDate) =>
                      setWithTime((prev) => ({
                        ...prev,
                        show: false,
                        date: selectedDate,
                      }))
                    }
                    onDismiss={() =>
                      setWithTime({
                        switch: false,
                        show: false,
                        date: null,
                      })
                    }
                  />
                ) : null}
              </View>
            </View>
          </TabsContent>

          <TabsContent value="NOTE">
            <View className="p-2 bg-slate-50 rounded-2xl shadow-sm shadow-black/50 mb-5">
              <Textarea
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholder="Title"
                numberOfLines={2}
                className="text-lg"
              />
              <Textarea
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder="Note"
                numberOfLines={4}
                className="text-base"
              />
            </View>
          </TabsContent>
        </Tabs>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </KeyboardProvider>
  );
}
