import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WordInfo } from '@/utils/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;  // 降低阈值，更容易触发

interface WordCardProps {
  word: WordInfo | null;
  onSwipeLeft: (word: WordInfo) => void;
  onSwipeRight: (word: WordInfo) => void;
  onLongPress?: (word: WordInfo) => void;
}

export default function WordCard({ word, onSwipeLeft, onSwipeRight, onLongPress }: WordCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const translateX = useMemo(() => new Animated.Value(0), []);

  const handleSwipeComplete = useCallback((direction: 'left' | 'right') => {
    if (!word) return;
    
    const toValue = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    Animated.timing(translateX, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (direction === 'left') {
        onSwipeLeft(word);
      } else {
        onSwipeRight(word);
      }
      translateX.setValue(0);
    });
  }, [word, translateX, onSwipeLeft, onSwipeRight]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          translateX.setValue(gestureState.dx);
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx, vx } = gestureState;
          
          if (dx < -SWIPE_THRESHOLD || vx < -0.3) {
            handleSwipeComplete('left');
          } else if (dx > SWIPE_THRESHOLD || vx > 0.3) {
            handleSwipeComplete('right');
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [translateX, handleSwipeComplete]
  );

  const handleLongPress = () => {
    if (word) {
      setShowMenu(true);
    }
  };

  if (!word) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>输入 #单词 后查看详情</Text>
        <Text style={styles.emptyHint}>左滑查看笔记列表，右滑查看词典</Text>
      </View>
    );
  }

  return (
    <>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={500}
          style={styles.cardContent}
        >
          {/* 左滑箭头 */}
          <View style={styles.swipeIndicatorLeft}>
            <Ionicons name="chevron-back" size={20} color="rgba(79, 70, 229, 0.4)" />
          </View>

          {/* 右滑箭头 */}
          <View style={styles.swipeIndicatorRight}>
            <Ionicons name="chevron-forward" size={20} color="rgba(79, 70, 229, 0.4)" />
          </View>

          {/* 单词头部 */}
          <View style={styles.header}>
            <View style={styles.wordContainer}>
              <Text style={styles.word}>{word.word}</Text>
              {word.mastered && (
                <View style={styles.masteredBadge}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </View>
            {word.phonetic && (
              <Text style={styles.phonetic}>{word.phonetic}</Text>
            )}
          </View>

          {/* 笔记摘要 */}
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>最近笔记</Text>
            <Text style={styles.noteContent} numberOfLines={2}>
              {word.recent_note_summary || '暂无笔记'}
            </Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* 长按菜单 */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>{word.word}</Text>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
              }}
            >
              <Ionicons name={word.mastered ? 'star' : 'star-outline'} size={18} color="#4F46E5" />
              <Text style={styles.menuText}>
                {word.mastered ? '取消掌握' : '标为已掌握'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
              }}
            >
              <Ionicons name="share-outline" size={18} color="#4F46E5" />
              <Text style={styles.menuText}>分享</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  emptyCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: '#9ca3af',
  },
  swipeIndicatorLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  swipeIndicatorRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  header: {
    marginBottom: 16,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  word: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  masteredBadge: {
    backgroundColor: '#10b981',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phonetic: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  noteSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
  },
  noteLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: SCREEN_WIDTH - 64,
    maxWidth: 320,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
  },
});
