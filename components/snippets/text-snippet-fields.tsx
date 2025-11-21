"use client";

import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import type { SnippetFormData } from "./form-types";

interface TextSnippetFieldsProps {
  form: UseFormReturn<SnippetFormData>;
}

export function TextSnippetFields({ form }: TextSnippetFieldsProps) {
  const content = form.watch("content") || "";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="text-content" className="text-sm font-medium">
          Content <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="text-content"
          {...form.register("content", {
            onChange: () => form.trigger("content"),
          })}
          placeholder="Enter your text snippet..."
          className="mt-1 min-h-[300px]"
          value={content}
        />
        {form.formState.errors.content && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.content.message}
          </p>
        )}
      </div>
    </div>
  );
}
