const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export interface WordInfo {
  id: number;
  word: string;
  phonetic: string | null;
  dict_cache: any;
  mastered: boolean;
  created_at: string;
  recent_note_summary: string | null;
  recent_note_id: number | null;
}

export interface Note {
  id: number;
  content: string;
  created_at: string;
  words?: { id: number; word: string }[];
}

export interface DictData {
  word: string;
  phonetic: string;
  phoneticAudio?: string;
  meanings: {
    partOfSpeech: string;
    definitions: string[];
    synonyms: string[];
    examples: string[];
  }[];
  message?: string;
}

/**
 * 服务端文件：server/src/routes/words.ts
 * 接口：GET /api/v1/words/:word
 * Path 参数：word: string - 单词文本
 */
export async function fetchWordInfo(word: string): Promise<{ success: boolean; data?: WordInfo; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/words/${encodeURIComponent(word)}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 服务端文件：server/src/routes/words.ts
 * 接口：GET /api/v1/words/:id/notes
 * Path 参数：id: number - 单词ID
 */
export async function fetchWordNotes(wordId: number): Promise<{ success: boolean; data?: Note[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/words/${wordId}/notes`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 服务端文件：server/src/routes/notes.ts
 * 接口：POST /api/v1/notes
 * Body 参数：content: string - 笔记内容
 */
export async function createNote(content: string): Promise<{ success: boolean; data?: Note & { extracted_tags: string[] }; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 服务端文件：server/src/routes/dict.ts
 * 接口：GET /api/v1/dict/:word
 * Path 参数：word: string - 单词文本
 */
export async function fetchDict(word: string): Promise<{ success: boolean; data?: DictData; error?: string; from_cache?: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/dict/${encodeURIComponent(word)}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 服务端文件：server/src/routes/words.ts
 * 接口：PATCH /api/v1/words/:id/mastered
 * Path 参数：id: number - 单词ID
 * Body 参数：mastered: boolean - 是否已掌握
 */
export async function updateWordMastered(wordId: number, mastered: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/words/${wordId}/mastered`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mastered }),
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
