"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  updateSnippetSchema,
  type UpdateSnippetInput,
} from "@/validations/snippets";
import { updateSnippet } from "@/actions/snippets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, FileText, Terminal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CommonFields } from "./common-fields";
import { CodeSnippetFields } from "./code-snippet-fields";
import { TextSnippetFields } from "./text-snippet-fields";
import { CommandSnippetFields } from "./command-snippet-fields";
import type { SnippetFormData } from "./form-types";
import type { Snippet } from "@/db/models/snippets";

interface EditSnippetFormProps {
  snippet: Snippet;
}

export function EditSnippetForm({ snippet }: EditSnippetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snippetType, setSnippetType] = useState<"code" | "text" | "command">(
    snippet.type
  );

  const form = useForm<SnippetFormData>({
    defaultValues: {
      type: snippet.type,
      title: snippet.title,
      tags: snippet.tags || [],
      content: snippet.content || "",
      language: snippet.language || "",
      framework: snippet.framework || "",
      command: snippet.command || "",
    },
    mode: "onChange",
    shouldUnregister: false,
  });

  // Update form when snippet changes
  useEffect(() => {
    form.reset({
      type: snippet.type,
      title: snippet.title,
      tags: snippet.tags || [],
      content: snippet.content || "",
      language: snippet.language || "",
      framework: snippet.framework || "",
      command: snippet.command || "",
    });
    setSnippetType(snippet.type);
  }, [snippet, form]);

  const handleTypeChange = (newType: "code" | "text" | "command") => {
    setSnippetType(newType);
    form.setValue("type", newType, { shouldValidate: true });

    // Clear irrelevant fields
    if (newType === "code") {
      form.setValue("command", "", { shouldValidate: false });
    } else if (newType === "text") {
      form.setValue("command", "", { shouldValidate: false });
      form.setValue("language", "", { shouldValidate: false });
      form.setValue("framework", "", { shouldValidate: false });
    } else if (newType === "command") {
      form.setValue("content", "", { shouldValidate: false });
      form.setValue("language", "", { shouldValidate: false });
      form.setValue("framework", "", { shouldValidate: false });
    }
  };

  const onSubmit = async (data: SnippetFormData) => {
    setIsSubmitting(true);

    try {
      const currentValues = form.getValues();

      const formData: UpdateSnippetInput = {
        id: snippet.id,
        type: currentValues.type,
        title: currentValues.title,
        tags: currentValues.tags || [],
        ...(currentValues.type === "code" && {
          content: currentValues.content || "",
          language: currentValues.language || undefined,
          framework: currentValues.framework || undefined,
        }),
        ...(currentValues.type === "text" && {
          content: currentValues.content || "",
        }),
        ...(currentValues.type === "command" && {
          command: currentValues.command || "",
        }),
      };

      const result = await updateSnippet(formData);

      if (!result.success) {
        if (result.details && Array.isArray(result.details)) {
          // Field-level validation errors
          const fieldErrors = result.details as Array<{
            path: string[];
            message: string;
          }>;
          fieldErrors.forEach((error) => {
            const fieldName = error.path[0] as keyof SnippetFormData;
            form.setError(fieldName, {
              type: "manual",
              message: error.message,
            });
          });
          toast.error("Please fix the errors in the form");
        } else {
          toast.error(result.error || "Failed to update snippet");
        }
        setIsSubmitting(false);
        return;
      }

      toast.success("Snippet updated successfully!");
      router.push(`/dashboard/snippets/${snippet.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating snippet:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs
        value={snippetType}
        onValueChange={(value) =>
          handleTypeChange(value as "code" | "text" | "command")
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="code">
            <Code2 className="mr-2 size-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="text">
            <FileText className="mr-2 size-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="command">
            <Terminal className="mr-2 size-4" />
            Command
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-6">
          <div className="space-y-6">
            <CommonFields form={form} />
            <CodeSnippetFields form={form} />
          </div>
        </TabsContent>

        <TabsContent value="text" className="mt-6">
          <div className="space-y-6">
            <CommonFields form={form} />
            <TextSnippetFields form={form} />
          </div>
        </TabsContent>

        <TabsContent value="command" className="mt-6">
          <div className="space-y-6">
            <CommonFields form={form} />
            <CommandSnippetFields form={form} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          Update Snippet
        </Button>
      </div>
    </form>
  );
}

