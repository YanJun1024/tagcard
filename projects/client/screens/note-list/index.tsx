import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { StatusBar } from 'expo-status-bar';
import { fetchWordNotes, fetchWordInfo, Note } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function NoteListPage() {
  const router = useSafeRouter();
  const { wordId, word, content, phonetic, phoneticAudio, meaning } = useSafeSearchParams<{ 
    wordId?: number; 
    word?: string;
    content?: string;
    phonetic?: string;
    phoneticAudio?: string;
    meaning?: string;
  }>();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    let actualWordId = wordId || NaN;
    
    // 如果 wordId 无效（0或NaN），通过 word 名称获取 ID
    if (isNaN(actualWordId) || actualWordId <= 0) {
      if (!word) {
        setError('无法获取单词信息');
        setIsLoading(false);
        return;
      }
      
      try {
        const wordResult = await fetchWordInfo(word);
        if (wordResult.success && wordResult.data) {
          actualWordId = wordResult.data.id;
        } else {
          setError('单词不存在');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError('加载失败');
        setIsLoading(false);
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchWordNotes(actualWordId);
      if (result.success && result.data) {
        setNotes(result.data);
      }
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('加载笔记失败');
    } finally {
      setIsLoading(false);
    }
  }, [wordId, word]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity style={styles.noteCard}>
      <Text style={styles.noteDate}>{formatDate(item.created_at)}</Text>
      <Text style={styles.noteContent} numberOfLines={4}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/', { 
              content: content || '',
              word: word,
              wordId: wordId,
              phonetic: phonetic,
              phoneticAudio: phoneticAudio,
              meaning: meaning
            })}
          >
            <Ionicons name="arrow-back" size={18} color="#374151" />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.title}>我的笔记</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 单词标签 */}
        <View style={styles.wordTag}>
          <Text style={styles.wordText}>#{word}</Text>
        </View>

        {/* 笔记列表 */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadNotes}>
              <Text style={styles.retryText}>重新加载</Text>
            </TouchableOpacity>
          </View>
        ) : notes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>暂无笔记</Text>
            <Text style={styles.emptyHint}>
              在编辑页输入包含 #{word} 的笔记
            </Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 新建笔记按钮 */}
        {notes.length > 0 && (
          <TouchableOpacity style={styles.fab}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 15,
    color: '#374151',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 60,
  },
  wordTag: {
    backgroundColor: '#4F46E5',
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  wordText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noteDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
