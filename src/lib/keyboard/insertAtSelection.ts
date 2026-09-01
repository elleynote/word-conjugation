export interface InsertionResult {
  value: string;
  caret: number;
}

export function insertAtSelection(value: string, insert: string, start: number, end: number): InsertionResult {
  const safeStart = Math.max(0, Math.min(start, value.length));
  const safeEnd = Math.max(safeStart, Math.min(end, value.length));
  const nextValue = `${value.slice(0, safeStart)}${insert}${value.slice(safeEnd)}`;
  return { value: nextValue, caret: safeStart + insert.length };
}

export function backspaceAtSelection(value: string, start: number, end: number): InsertionResult {
  const safeStart = Math.max(0, Math.min(start, value.length));
  const safeEnd = Math.max(safeStart, Math.min(end, value.length));
  if (safeStart !== safeEnd) return insertAtSelection(value, "", safeStart, safeEnd);
  if (safeStart === 0) return { value, caret: 0 };
  return insertAtSelection(value, "", safeStart - 1, safeStart);
}
