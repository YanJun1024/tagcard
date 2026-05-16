import { Router } from 'express';
import { getWords, getWordNotes, getNotes, getNextWordId, addWord, type Word, type Note } from '../storage/memory-storage';

const router = Router();

// 获取单词的所有笔记列表（必须在 /:word 之前定义）
router.get('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const wordId = parseInt(id);

    // 获取该单词关联的笔记
    const wordNotes = getWordNotes();
    const notes = getNotes();
    const wordNoteLinks = wordNotes.filter(wn => wn.word_id === wordId);
    
    // 获取笔记详情并按创建时间排序
    const noteList = wordNoteLinks
      .map(wn => {
        const note = notes.find(n => n.id === wn.note_id);
        return note ? { ...note, word_note_id: wn.word_id } : null;
      })
      .filter((n): n is Note => n !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: noteList,
    });
  } catch (error: any) {
    console.error('Error in GET /words/:id/notes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新单词状态（标记为已掌握）
router.patch('/:id/mastered', async (req, res) => {
  try {
    const { id } = req.params;
    const { mastered } = req.body;
    const wordId = parseInt(id);

    const words = getWords();
    const word = words.find(w => w.id === wordId);

    if (!word) {
      res.status(404).json({ success: false, error: '单词不存在' });
      return;
    }

    word.mastered = mastered;

    res.json({ success: true, data: { id: word.id, word: word.word, mastered: word.mastered } });
  } catch (error: any) {
    console.error('Error in PATCH /words/:id/mastered:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取或创建单词，并返回最近一条笔记摘要
router.get('/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const wordLower = word.toLowerCase();

    // 查询单词是否存在
    const words = getWords();
    let wordData = words.find(w => w.word === wordLower);

    // 如果单词不存在，创建新单词
    if (!wordData) {
      const newWord: Word = {
        id: getNextWordId(),
        word: wordLower,
        phonetic: null,
        dict_cache: null,
        mastered: false,
        created_at: new Date().toISOString(),
        recent_note_summary: null,
        recent_note_id: null,
      };
      addWord(newWord);
      wordData = newWord;
    }

    // 查询该单词最近的一条笔记摘要
    const wordNotes = getWordNotes();
    const notes = getNotes();
    const wordNoteLinks = wordNotes.filter(wn => wn.word_id === wordData.id);
    const recentWordNote = wordNoteLinks
      .sort((a, b) => {
        const noteA = notes.find(n => n.id === a.note_id);
        const noteB = notes.find(n => n.id === b.note_id);
        if (!noteA || !noteB) return 0;
        return new Date(noteB.created_at).getTime() - new Date(noteA.created_at).getTime();
      })[0];

    const recentNote = recentWordNote ? notes.find(n => n.id === recentWordNote.note_id) : null;

    res.json({
      success: true,
      data: {
        ...wordData,
        recent_note_summary: recentNote?.content?.substring(0, 50) || null,
        recent_note_id: recentNote?.id || null,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /words/:word:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
