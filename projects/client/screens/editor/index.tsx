import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { Screen } from '@/components/Screen';
import WordCard from '@/components/WordCard';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { fetchWordInfo, WordInfo, createNote } from '@/utils/api';

export default function EditorPage() {
  const router = useSafeRouter();
  const { 
    content: savedContent, 
    word: savedWord,
    wordId,
    phonetic,
    phoneticAudio,
    meaning
  } = useSafeSearchParams<{ 
    content?: string; 
    word?: string;
    wordId?: number;
    phonetic?: string;
    phoneticAudio?: string;
    meaning?: string;
  }>();
  const [content, setContent] = useState(savedContent || '');
  const [currentWord, setCurrentWord] = useState<WordInfo | null>(
    savedWord && wordId ? {
      id: wordId,
      word: savedWord,
      phonetic: phonetic || null,
      dict_cache: null,
      mastered: false,
      created_at: new Date().toISOString(),
      recent_note_summary: null,
      recent_note_id: null,
    } : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const lastTagRef = useRef<string>('');

  useEffect(() => {
    if (savedContent || savedWord) {
      router.setParams({ 
        content: undefined, 
        word: undefined,
        wordId: undefined,
        phonetic: undefined,
        phoneticAudio: undefined,
        meaning: undefined
      });
    }
  }, [savedContent, savedWord, router]);

  // 检测 #单词+空格 标签
  const detectTag = useCallback((text: string) => {
    const regex = /#(\w+)\s/g;
    const matches = text.match(regex);
    if (matches) {
      const lastMatch = matches[matches.length - 1];
      const word = lastMatch.replace('#', '').trim();
      if (word !== lastTagRef.current && word.length > 0) {
        lastTagRef.current = word;
        return word;
      }
    }
    return null;
  }, []);

  // 查询单词信息
  const searchWord = useCallback(async (word: string) => {
    setIsLoading(true);
    try {
      const result = await fetchWordInfo(word);
      if (result.success && result.data) {
        setCurrentWord(result.data);
      } else {
        setCurrentWord({
          id: 0,
          word: word,
          phonetic: null,
          dict_cache: null,
          mastered: false,
          created_at: new Date().toISOString(),
          recent_note_summary: null,
          recent_note_id: null,
        });
      }
    } catch (error) {
      console.error('Error searching word:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 处理文本变化
  const handleTextChange = useCallback((text: string) => {
    setContent(text);
    const tag = detectTag(text);
    if (tag) {
      searchWord(tag);
    }
  }, [detectTag, searchWord]);

  // 保存笔记
  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请输入笔记内容');
      return;
    }

    try {
      Keyboard.dismiss();
      const result = await createNote(content);
      if (result.success) {
        Alert.alert('成功', '笔记已保存');
        setContent('');
        setCurrentWord(null);
        lastTagRef.current = '';
      } else {
        Alert.alert('错误', result.error || '保存失败');
      }
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    }
  }, [content]);

  // 左滑打开笔记列表
  const handleSwipeLeft = useCallback((word: WordInfo) => {
    Keyboard.dismiss();
    router.push('/note-list', { 
      wordId: word.id, 
      word: word.word,
      content: content,
      phonetic: word.phonetic
    });
  }, [router, content]);

  // 右滑打开词典
  const handleSwipeRight = useCallback((word: WordInfo) => {
    Keyboard.dismiss();
    router.push('/dict', { 
      word: word.word, 
      content: content,
      wordId: word.id,
      phonetic: word.phonetic
    });
  }, [router, content]);

  // 长按菜单
  const handleLongPress = useCallback((word: WordInfo) => {
    // 菜单已在 WordCard 组件内处理
  }, []);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* 顶部卡片区域 */}
        <View style={styles.cardSection}>
          <WordCard
            word={currentWord}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onLongPress={handleLongPress}
          />
        </View>

        {/* 输入区域 */}
        <View style={styles.inputSection}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="记录你的笔记... 使用 #单词 标记单词"
            placeholderTextColor="#9ca3af"
            multiline
            value={content}
            onChangeText={handleTextChange}
            textAlignVertical="top"
          />
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            !content.trim() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!content.trim()}
        >
          <Text style={styles.saveButtonText}>保存笔记</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  cardSection: {
    paddingTop: 8,
  },
  inputSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
    minHeight: 200,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
