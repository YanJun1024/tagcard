import { pgTable, serial, timestamp, varchar, jsonb, boolean, integer, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 单词表
export const words = pgTable("words", {
  id: serial().primaryKey(),
  word: varchar("word", { length: 100 }).notNull().unique(),
  phonetic: varchar("phonetic", { length: 100 }),
  dict_cache: jsonb("dict_cache"),
  mastered: boolean("mastered").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("words_word_idx").on(table.word),
  index("words_created_at_idx").on(table.created_at),
]);

// 笔记表
export const notes = pgTable("notes", {
  id: serial().primaryKey(),
  content: varchar("content", { length: 10000 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("notes_created_at_idx").on(table.created_at),
]);

// 单词-笔记关联表
export const wordNotes = pgTable("word_notes", {
  id: serial().primaryKey(),
  word_id: integer("word_id").notNull().references(() => words.id, { onDelete: "cascade" }),
  note_id: integer("note_id").notNull().references(() => notes.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("word_notes_word_id_idx").on(table.word_id),
  index("word_notes_note_id_idx").on(table.note_id),
  index("word_notes_created_at_idx").on(table.created_at),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
