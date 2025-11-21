import { z } from "zod";

export const createSnippetSchema = z
  .discriminatedUnion("type", [
    // Code snippet
    z.object({
      type: z.literal("code"),
      title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be 200 characters or less")
        .refine((val) => val.trim().length > 0, {
          message: "Title cannot be empty or only whitespace",
        }),
      tags: z
        .array(z.string().min(1, "Tag cannot be empty").max(50, "Tag must be 50 characters or less"))
        .default([])
        .refine((tags) => tags.length <= 10, {
          message: "Maximum 10 tags allowed",
        }),
      content: z
        .string()
        .min(1, "Code content is required")
        .max(50000, "Code content is too long (maximum 50,000 characters)")
        .refine((val) => val.trim().length > 0, {
          message: "Code content cannot be empty or only whitespace",
        }),
      language: z.string().max(50, "Language name is too long").optional(),
      framework: z.string().max(100, "Framework name is too long").optional(),
    }),
    // Text snippet
    z.object({
      type: z.literal("text"),
      title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be 200 characters or less")
        .refine((val) => val.trim().length > 0, {
          message: "Title cannot be empty or only whitespace",
        }),
      tags: z
        .array(z.string().min(1, "Tag cannot be empty").max(50, "Tag must be 50 characters or less"))
        .default([])
        .refine((tags) => tags.length <= 10, {
          message: "Maximum 10 tags allowed",
        }),
      content: z
        .string()
        .min(1, "Text content is required")
        .max(100000, "Text content is too long (maximum 100,000 characters)")
        .refine((val) => val.trim().length > 0, {
          message: "Text content cannot be empty or only whitespace",
        }),
    }),
    // Command snippet
    z.object({
      type: z.literal("command"),
      title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be 200 characters or less")
        .refine((val) => val.trim().length > 0, {
          message: "Title cannot be empty or only whitespace",
        }),
      tags: z
        .array(z.string().min(1, "Tag cannot be empty").max(50, "Tag must be 50 characters or less"))
        .default([])
        .refine((tags) => tags.length <= 10, {
          message: "Maximum 10 tags allowed",
        }),
      command: z
        .string()
        .min(1, "Command is required")
        .max(10000, "Command is too long (maximum 10,000 characters)")
        .refine((val) => val.trim().length > 0, {
          message: "Command cannot be empty or only whitespace",
        }),
    }),
  ]);

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
