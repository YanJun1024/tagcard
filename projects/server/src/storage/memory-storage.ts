// 内存数据存储
export interface Note {
  id: number;
  content: string;
  created_at: string;
}

export interface Word {
  id: number;
  word: string;
  phonetic: string | null;
  dict_cache: any;
  mastered: boolean;
  created_at: string;
  recent_note_summary: string | null;
  recent_note_id: number | null;
}

export interface WordNote {
  word_id: number;
  note_id: number;
}

let _notes: Note[] = [];
let _words: Word[] = [];
let _wordNotes: WordNote[] = [];
let _nextNoteId = 1;
let _nextWordId = 1;

export function getNotes(): Note[] {
  return _notes;
}

export function getWords(): Word[] {
  return _words;
}

export function getWordNotes(): WordNote[] {
  return _wordNotes;
}

export function getNextNoteId(): number {
  return _nextNoteId++;
}

export function getNextWordId(): number {
  return _nextWordId++;
}

export function addNote(note: Note): void {
  _notes.push(note);
}

export function addWord(word: Word): void {
  _words.push(word);
}

export function addWordNote(wordNote: WordNote): void {
  _wordNotes.push(wordNote);
}

// 重置数据（用于测试）
export function resetStorage(): void {
  _notes = [];
  _words = [];
  _wordNotes = [];
  _nextNoteId = 1;
  _nextWordId = 1;
}
