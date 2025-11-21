"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { SnippetFormData } from "./form-types";

interface CommonFieldsProps {
  form: UseFormReturn<SnippetFormData>;
  onTagsChange: (value: string) => void;
}

export function CommonFields({ form, onTagsChange }: CommonFieldsProps) {
  return (
    <div className="space-y-4 pt-4">
      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          {...form.register("title")}
          placeholder="e.g., Authentication helper"
          className="mt-1"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="tags" className="text-sm font-medium">
          Tags
        </label>
        <Input
          id="tags"
          placeholder="e.g., auth, react, typescript (comma-separated)"
          onChange={(e) => onTagsChange(e.target.value)}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Separate tags with commas
        </p>
      </div>
    </div>
  );
}
