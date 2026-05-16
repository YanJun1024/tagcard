const https = require('https');

https.get('https://api.dictionaryapi.dev/api/v2/entries/en/apple', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const apiData = JSON.parse(data);
      console.log('API Response structure:');
      console.log(JSON.stringify(apiData[0], null, 2));
      
      // Parse like our code does
      const entry = apiData[0];
      const meanings = [];
      
      if (entry.meanings) {
        entry.meanings.forEach((meaning) => {
          const definitions = [];
          if (meaning.definitions) {
            meaning.definitions.forEach((def) => {
              if (def.definition) {
                definitions.push(def.definition);
              }
            });
          }
          
          meanings.push({
            partOfSpeech: meaning.partOfSpeech || '',
            definitions,
            synonyms: meaning.synonyms || [],
            examples: meaning.definitions?.map((d) => d.example).filter(Boolean) || [],
          });
        });
      }
      
      const result = {
        word: entry.word || '',
        phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
        phoneticAudio: entry.phonetics?.find((p) => p.audio)?.audio || '',
        meanings,
      };
      
      console.log('\nParsed result:');
      console.log(JSON.stringify(result, null, 2));
      console.log('\nDefinitions type:', Array.isArray(result.meanings[0].definitions));
      console.log('Synonyms type:', Array.isArray(result.meanings[0].synonyms));
      console.log('Examples type:', Array.isArray(result.meanings[0].examples));
    } catch (error) {
      console.error('Error:', error);
    }
  });
}).on('error', (error) => {
  console.error('Error:', error);
});
