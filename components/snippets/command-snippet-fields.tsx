"use client";

import { UseFormReturn } from "react-hook-form";
import { CodeEditor } from "./code-editor";
import type { SnippetFormData } from "./form-types";

interface CommandSnippetFieldsProps {
  form: UseFormReturn<SnippetFormData>;
}

export function CommandSnippetFields({ form }: CommandSnippetFieldsProps) {
  const command = form.watch("command") || "";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="command" className="text-sm font-medium">
          Command <span className="text-destructive">*</span>
        </label>
        <div className="mt-1">
          <CodeEditor
            value={command}
            onChange={(value) => {
              form.setValue("command", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            language="shell"
          />
        </div>
        {form.formState.errors.command && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.command.message}
          </p>
        )}
      </div>
    </div>
  );
}
