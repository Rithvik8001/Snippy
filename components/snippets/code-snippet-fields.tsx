"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeEditor } from "./code-editor";
import type { SnippetFormData } from "./form-types";

const languages = [
  "typescript",
  "javascript",
  "python",
  "java",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "csharp",
  "cpp",
  "c",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "sql",
  "bash",
  "shell",
  "dockerfile",
  "markdown",
  "other",
] as const;

interface CodeSnippetFieldsProps {
  form: UseFormReturn<SnippetFormData>;
}

export function CodeSnippetFields({ form }: CodeSnippetFieldsProps) {
  const language = form.watch("language") || "";
  const content = form.watch("content") || "";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="language" className="text-sm font-medium">
          Language
        </label>
        <Select
          onValueChange={(value) => {
            form.setValue("language", value, { shouldValidate: true });
          }}
          value={language}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="framework" className="text-sm font-medium">
          Framework
        </label>
        <Input
          id="framework"
          {...form.register("framework")}
          placeholder="e.g., React, Next.js, Express"
          className="mt-1"
        />
      </div>

      <div className="relative z-0">
        <label htmlFor="content" className="text-sm font-medium">
          Code <span className="text-destructive">*</span>
        </label>
        <div className="mt-1" style={{ position: "relative", zIndex: 10 }}>
          <CodeEditor
            value={content}
            onChange={(value) => {
              form.setValue("content", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            language={language || undefined}
          />
        </div>
        {form.formState.errors.content && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.content.message}
          </p>
        )}
      </div>
    </div>
  );
}
