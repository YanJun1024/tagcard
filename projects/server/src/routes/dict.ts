import { Router } from 'express';

const router = Router();

// 内存缓存
const cache: Record<string, any> = {};

// 获取词典信息（直接从 API 获取）
router.get('/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const wordLower = word.toLowerCase();
    
    console.log(`[DICT] Request received for word: "${word}" (lowercase: "${wordLower}")`);

    // 先从缓存中查找
    if (cache[wordLower]) {
      console.log(`[DICT] Found in cache: ${wordLower}`);
      res.json({
        success: true,
        data: cache[wordLower],
        from_cache: true,
      });
      return;
    }

    // 从 API 获取词典数据
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordLower)}`;
    console.log(`[DICT] Fetching from API: ${apiUrl}`);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.log(`[DICT] API response not ok: ${response.status}`);
      res.json({
        success: true,
        data: {
          word: wordLower,
          phonetic: '',
          meanings: [],
          message: '词典详情暂不可用',
        },
        from_cache: false,
      });
      return;
    }

    const apiData = await response.json();
    const dictData = parseDictData(apiData);

    // 保存到缓存
    cache[wordLower] = dictData;
    console.log(`[DICT] Successfully fetched and cached: ${wordLower}`);

    res.json({
      success: true,
      data: dictData,
      from_cache: false,
    });
  } catch (error: any) {
    console.error('[DICT] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 解析词典 API 返回的数据
function parseDictData(apiData: any[]): any {
  if (!apiData || !apiData.length) {
    return { word: '', phonetic: '', meanings: [] };
  }

  const entry = apiData[0];
  const meanings: any[] = [];

  if (entry.meanings) {
    entry.meanings.forEach((meaning: any) => {
      const definitions: string[] = [];
      if (meaning.definitions) {
        meaning.definitions.forEach((def: any) => {
          if (def.definition) {
            definitions.push(def.definition);
          }
        });
      }

      meanings.push({
        partOfSpeech: meaning.partOfSpeech || '',
        definitions,
        synonyms: meaning.synonyms || [],
        examples: meaning.definitions?.map((d: any) => d.example).filter(Boolean) || [],
      });
    });
  }

  return {
    word: entry.word || '',
    phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
    phoneticAudio: entry.phonetics?.find((p: any) => p.audio)?.audio || '',
    meanings,
  };
}

export default router;
