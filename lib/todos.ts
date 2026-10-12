import type { ToDo } from '@/models';

function time(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

function newestFirst(a: string | undefined, b: string | undefined): number {
  const ta = time(a);
  const tb = time(b);
  if (ta === null || tb === null) return 0;
  return tb - ta;
}

export function groupTodos(items: ToDo[]) {
  const open = items
    .filter((todo) => !todo.completed)
    .sort((a, b) => {
      const da = time(a.deadline);
      const db = time(b.deadline);
      if (da !== null && db !== null) return da - db;
      if (da !== null) return -1;
      if (db !== null) return 1;
      return newestFirst(a.created_at, b.created_at);
    });

  const completed = items
    .filter((todo) => todo.completed)
    .sort((a, b) => newestFirst(a.updated_at, b.updated_at));

  return { open, completed };
}
