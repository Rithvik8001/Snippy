import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const snippetTypeEnum = pgEnum("snippet_type", [
  "code",
  "text",
  "command",
]);

export const snippets = pgTable("snippets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // clerk user id
  type: snippetTypeEnum("type").notNull(),
  title: text("title").notNull(),
  tags: text("tags").array().notNull().default([]),
  isFavorite: boolean("is_favorite").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
  useCount: integer("use_count").notNull().default(0),

  // Type-specific fields
  // For code snippets
  content: text("content"),
  language: text("language"),
  framework: text("framework"),

  // For command snippets
  command: text("command"),
});

export type Snippet = typeof snippets.$inferSelect;
export type NewSnippet = typeof snippets.$inferInsert;
