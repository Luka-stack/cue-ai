import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Fragment, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';

/**
 * Renders the small slice of Markdown the agent writes: paragraphs, headings,
 * bullet and numbered lists, fenced code, and inline **bold**, *italic* and
 * `code`. Anything else shows as plain text, so nothing is ever lost.
 */

type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'item'; marker: string; depth: number; text: string }
  | { type: 'code'; text: string };

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^(\s*)[-*•+]\s+(.*)$/;
const NUMBERED = /^(\s*)(\d+)[.)]\s+(.*)$/;
const FENCE = /^\s*```/;

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let code: string[] | null = null;

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join('\n') });
      paragraph = [];
    }
  };

  for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
    if (code) {
      if (FENCE.test(line)) {
        blocks.push({ type: 'code', text: code.join('\n') });
        code = null;
      } else {
        code.push(line);
      }
      continue;
    }

    if (FENCE.test(line)) {
      flush();
      code = [];
      continue;
    }

    if (!line.trim()) {
      flush();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        text: heading[2],
      });
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      flush();
      blocks.push({
        type: 'item',
        marker: '•',
        depth: Math.floor(bullet[1].length / 2),
        text: bullet[2],
      });
      continue;
    }

    const numbered = NUMBERED.exec(line);
    if (numbered) {
      flush();
      blocks.push({
        type: 'item',
        marker: `${numbered[2]}.`,
        depth: Math.floor(numbered[1].length / 2),
        text: numbered[3],
      });
      continue;
    }

    paragraph.push(line);
  }

  // An unclosed fence still shows its content.
  if (code) blocks.push({ type: 'code', text: code.join('\n') });
  flush();

  return blocks;
}

// `code` first so markers inside it stay literal; `_` is left alone so
// snake_case words aren't turned italic.
const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <Text key={i} className="rounded bg-muted px-1 font-mono text-sm">
          {part.slice(1, -1)}
        </Text>
      );
    }
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} className="font-semibold">
          {renderInline(part.slice(2, -2))}
        </Text>
      );
    }
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
      return (
        <Text key={i} className="italic">
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const HEADING_CLASS = [
  'text-xl font-bold',
  'text-lg font-bold',
  'font-semibold',
];

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const blocks = useMemo(() => parseBlocks(children), [children]);

  return (
    <View className={cn('gap-2', className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <Text
                key={i}
                role="heading"
                className={HEADING_CLASS[Math.min(block.level, 3) - 1]}
              >
                {renderInline(block.text)}
              </Text>
            );
          case 'item':
            return (
              <View
                key={i}
                className="flex-row gap-2"
                style={{ paddingLeft: block.depth * 16 }}
              >
                <Text className="min-w-4 text-muted-foreground">
                  {block.marker}
                </Text>
                <Text className="flex-1">{renderInline(block.text)}</Text>
              </View>
            );
          case 'code':
            return (
              <View key={i} className="rounded-lg bg-muted px-3 py-2">
                <Text className="font-mono text-sm">{block.text}</Text>
              </View>
            );
          default:
            return <Text key={i}>{renderInline(block.text)}</Text>;
        }
      })}
    </View>
  );
}
