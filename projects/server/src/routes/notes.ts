import { Router } from 'express';
import { getNotes, getWords, getWordNotes, getNextNoteId, getNextWordId, addNote, addWord, addWordNote, type Note, type Word } from '../storage/memory-storage';

const router = Router();

// 创建笔记并提取标签
router.post('/', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json({ success: false, error: '内容不能为空' });
      return;
    }

    // 创建笔记
    const noteId = getNextNoteId();
    const note: Note = {
      id: noteId,
      content,
      created_at: new Date().toISOString(),
    };
    addNote(note);

    // 提取 #单词 标签
    const tagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      const word = match[1].toLowerCase();
      if (!tags.includes(word)) {
        tags.push(word);
      }
    }

    // 处理每个标签
    const words = getWords();
    for (const wordText of tags) {
      // 查找或创建单词
      let existingWord = words.find(w => w.word === wordText);
      let wordId: number;

      if (existingWord) {
        wordId = existingWord.id;
        // 更新最近笔记摘要
        existingWord.recent_note_summary = content.substring(0, 100) + (content.length > 100 ? '...' : '');
        existingWord.recent_note_id = note.id;
      } else {
        const newWord: Word = {
          id: getNextWordId(),
          word: wordText,
          phonetic: null,
          dict_cache: null,
          mastered: false,
          created_at: new Date().toISOString(),
          recent_note_summary: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          recent_note_id: note.id,
        };
        addWord(newWord);
        wordId = newWord.id;
      }

      // 创建关联记录
      addWordNote({ word_id: wordId, note_id: note.id });
    }

    res.json({
      success: true,
      data: {
        ...note,
        extracted_tags: tags,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /notes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取笔记详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const noteId = parseInt(id);

    const notes = getNotes();
    const note = notes.find(n => n.id === noteId);

    if (!note) {
      res.status(404).json({ success: false, error: '笔记不存在' });
      return;
    }

    // 获取关联的单词
    const wordNotes = getWordNotes();
    const words = getWords();
    const wordNoteLinks = wordNotes.filter(wn => wn.note_id === noteId);
    const linkedWords = wordNoteLinks
      .map(wn => words.find(w => w.id === wn.word_id))
      .filter((w): w is Word => w !== undefined);

    res.json({
      success: true,
      data: {
        ...note,
        words: linkedWords.map(w => ({ id: w.id, word: w.word })),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /notes/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
