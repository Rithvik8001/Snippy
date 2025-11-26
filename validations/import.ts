import { z } from "zod";
import { createSnippetSchema } from "./snippets";

/**
 * Schema for importing a single snippet (id is optional)
 */
export const importSnippetSchema = z.discriminatedUnion("type", [
  // Code snippet
  z.object({
    id: z.string().optional(),
    type: z.literal("code"),
    title: z.string().min(1).max(200),
    tags: z.array(z.string()).max(20).default([]),
    content: z.string().min(1).max(50000),
    language: z.string().max(50).optional(),
    framework: z.string().max(50).optional(),
    isFavorite: z.boolean().default(false),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    lastUsedAt: z.string().datetime().nullable().optional(),
    useCount: z.number().int().nonnegative().default(0),
  }),
  // Text snippet
  z.object({
    id: z.string().optional(),
    type: z.literal("text"),
    title: z.string().min(1).max(200),
    tags: z.array(z.string()).max(20).default([]),
    content: z.string().min(1).max(50000),
    isFavorite: z.boolean().default(false),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    lastUsedAt: z.string().datetime().nullable().optional(),
    useCount: z.number().int().nonnegative().default(0),
  }),
  // Command snippet
  z.object({
    id: z.string().optional(),
    type: z.literal("command"),
    title: z.string().min(1).max(200),
    tags: z.array(z.string()).max(20).default([]),
    command: z.string().min(1).max(5000),
    isFavorite: z.boolean().default(false),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    lastUsedAt: z.string().datetime().nullable().optional(),
    useCount: z.number().int().nonnegative().default(0),
  }),
]);

export type ImportSnippetInput = z.infer<typeof importSnippetSchema>;

/**
 * Schema for array of snippets (for JSON import)
 */
export const importSnippetsArraySchema = z.array(importSnippetSchema);

/**
 * Schema for export metadata (optional, for JSON imports)
 */
export const exportMetadataSchema = z.object({
  exportedAt: z.string().optional(),
  version: z.string().optional(),
  totalCount: z.number().optional(),
});

/**
 * Schema for full export format (with metadata)
 */
export const exportFormatSchema = z.object({
  metadata: exportMetadataSchema.optional(),
  snippets: importSnippetsArraySchema,
});

/**
 * Schema for CSV row
 */
export const csvRowSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["code", "text", "command"]),
  title: z.string().min(1).max(200),
  tags: z.string().transform((val) => {
    if (!val || val.trim() === "") return [];
    return val.split(",").map((tag) => tag.trim()).filter(Boolean);
  }),
  content: z.string().optional(),
  command: z.string().optional(),
  language: z.string().optional(),
  framework: z.string().optional(),
  isFavorite: z
    .string()
    .transform((val) => val.toLowerCase() === "true")
    .default("false"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastUsedAt: z.string().nullable().optional(),
  useCount: z
    .string()
    .transform((val) => parseInt(val, 10) || 0)
    .default("0"),
});

