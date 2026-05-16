import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { StatusBar } from 'expo-status-bar';
import { fetchDict, DictData } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function DictPage() {
  const router = useSafeRouter();
  const { word, content, wordId, phonetic, phoneticAudio, meaning } = useSafeSearchParams<{ 
    word?: string; 
    content?: string;
    wordId?: number;
    phonetic?: string;
    phoneticAudio?: string;
    meaning?: string;
  }>();
  const [dictData, setDictData] = useState<DictData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDict = useCallback(async () => {
    if (!word) {
      setError('未获取到单词');
      setIsLoading(false);
      return;
    }

    console.log('Loading dict for word:', word);
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDict(word);
      console.log('Dict result:', result);
      if (result.success && result.data) {
        setDictData(result.data);
      } else {
        setError(result.error || '加载词典失败');
      }
    } catch (err) {
      console.error('Error loading dict:', err);
      setError('加载词典失败，请检查网络');
    } finally {
      setIsLoading(false);
    }
  }, [word]);

  useEffect(() => {
    loadDict();
  }, [loadDict]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.container}>
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
            <Text style={styles.title}>词典详情</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>正在加载词典...</Text>
          </View>
        </View>
      </Screen>
    );
  }

  if (error || !dictData) {
    return (
      <Screen>
        <StatusBar style="dark" />
        <View style={styles.container}>
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
            <Text style={styles.title}>词典详情</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error || '词典暂不可用'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadDict}>
              <Text style={styles.retryText}>重新加载</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

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
          <Text style={styles.title}>词典详情</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 单词头部 */}
          <View style={styles.wordHeader}>
            <Text style={styles.word}>{dictData.word}</Text>
            {dictData.phonetic && (
              <Text style={styles.phonetic}>{dictData.phonetic}</Text>
            )}
          </View>

          {/* 释义列表 */}
          {dictData.meanings?.map((item, index) => (
            <View key={index} style={styles.meaningCard}>
              <View style={styles.posTag}>
                <Text style={styles.posText}>{item.partOfSpeech}</Text>
              </View>

              {/* 释义 */}
              {item.definitions?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>释义</Text>
                  {item.definitions.map((def, defIndex) => (
                    <View key={defIndex} style={styles.definitionItem}>
                      <Text style={styles.definitionNumber}>{defIndex + 1}.</Text>
                      <Text style={styles.definitionText}>{def}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 例句 */}
              {item.examples?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>例句</Text>
                  {item.examples.slice(0, 2).map((example, exIndex) => (
                    <View key={exIndex} style={styles.exampleItem}>
                      <Ionicons name="chatbubble-outline" size={12} color="#9ca3af" style={styles.quoteIcon} />
                      <Text style={styles.exampleText}>{example}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 同义词 */}
              {item.synonyms?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>同义词</Text>
                  <View style={styles.synonymsContainer}>
                    {item.synonyms.slice(0, 6).map((syn, synIndex) => (
                      <View key={synIndex} style={styles.synonymTag}>
                        <Text style={styles.synonymText}>{syn}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* 无数据提示 */}
          {(!dictData.meanings || dictData.meanings.length === 0) && (
            <View style={styles.noDataContainer}>
              <Ionicons name="book-outline" size={32} color="#d1d5db" />
              <Text style={styles.noDataText}>词典详情暂不可用</Text>
            </View>
          )}
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    color: '#ef4444',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  wordHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  word: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1f2937',
  },
  phonetic: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 8,
  },
  meaningCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  posTag: {
    backgroundColor: '#4F46E5',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  posText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  definitionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  definitionNumber: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '600',
    marginRight: 8,
    width: 20,
  },
  definitionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  exampleItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  quoteIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  synonymsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  synonymTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  synonymText: {
    fontSize: 13,
    color: '#4b5563',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 15,
    color: '#9ca3af',
  },
});
