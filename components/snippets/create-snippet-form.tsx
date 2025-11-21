"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  createSnippetSchema,
  type CreateSnippetInput,
} from "@/validations/snippets";
import { createSnippet } from "@/actions/snippets";
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

export function CreateSnippetForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snippetType, setSnippetType] = useState<"code" | "text" | "command">(
    "code"
  );

  const form = useForm<SnippetFormData>({
    defaultValues: {
      type: "code",
      title: "",
      tags: [],
      content: "",
      language: "",
      framework: "",
      command: "",
    },
    mode: "onChange",
    shouldUnregister: false,
  });

  const onSubmit = async (data: SnippetFormData) => {
    setIsSubmitting(true);

    try {
      // Get current form values
      const currentValues = form.getValues();

      // Prepare form data based on current type
      let formData: CreateSnippetInput;

      if (snippetType === "code") {
        formData = {
          type: "code",
          title: (currentValues.title || data.title || "").trim(),
          tags: currentValues.tags || data.tags || [],
          content: (currentValues.content || data.content || "").trim(),
          language: currentValues.language?.trim() || data.language?.trim(),
          framework: currentValues.framework?.trim() || data.framework?.trim(),
        };
      } else if (snippetType === "text") {
        formData = {
          type: "text",
          title: (currentValues.title || data.title || "").trim(),
          tags: currentValues.tags || data.tags || [],
          content: (currentValues.content || data.content || "").trim(),
        };
      } else {
        formData = {
          type: "command",
          title: (currentValues.title || data.title || "").trim(),
          tags: currentValues.tags || data.tags || [],
          command: (currentValues.command || data.command || "").trim(),
        };
      }

      // Validate with Zod before submitting
      try {
        createSnippetSchema.parse(formData);
      } catch (validationError) {
        if (
          validationError &&
          typeof validationError === "object" &&
          "issues" in validationError
        ) {
          const zodError = validationError as {
            issues: Array<{ path: (string | number)[]; message: string }>;
          };

          // Set form errors for better UX
          zodError.issues.forEach((issue) => {
            const fieldName = issue.path[0] as keyof SnippetFormData;
            if (fieldName) {
              form.setError(fieldName, {
                type: "manual",
                message: issue.message,
              });
            }
          });

          // Show first error as toast
          const firstError = zodError.issues[0];
          toast.error(`${firstError.path.join(".")}: ${firstError.message}`, {
            description:
              zodError.issues.length > 1
                ? `${zodError.issues.length - 1} more error${
                    zodError.issues.length > 2 ? "s" : ""
                  }`
                : undefined,
          });

          setIsSubmitting(false);
          return;
        }
        throw validationError;
      }

      // Submit to server action
      const result = await createSnippet(formData);

      if (result.success) {
        toast.success("Snippet created successfully!", {
          description: "Your snippet has been saved.",
        });
        router.push("/dashboard");
        return;
      }

      // Handle error case (result.success === false)
      const errorMessage = result.error;
      const errorCode = result.code;

      // Show appropriate error message based on error code
      if (errorCode === "VALIDATION_ERROR" && result.details) {
        const details = result.details as Array<{
          path: string[];
          message: string;
        }>;

        // Set form errors
        details.forEach((err) => {
          const fieldName = err.path[0] as keyof SnippetFormData;
          if (fieldName) {
            form.setError(fieldName, {
              type: "manual",
              message: err.message,
            });
          }
        });

        // Show first error as toast
        const firstError = details[0];
        toast.error(`${firstError.path.join(".")}: ${firstError.message}`, {
          description:
            details.length > 1
              ? `${details.length - 1} more error${
                  details.length > 2 ? "s" : ""
                }`
              : undefined,
        });
      } else if (errorCode === "AUTHENTICATION_ERROR") {
        toast.error("Authentication required", {
          description: "Please sign in to create snippets.",
          action: {
            label: "Sign In",
            onClick: () => router.push("/sign-in"),
          },
        });
      } else if (errorCode === "DATABASE_ERROR") {
        toast.error("Database error", {
          description: errorMessage,
          duration: 5000,
        });
      } else {
        toast.error(errorMessage, {
          description:
            "Please try again or contact support if the problem persists.",
          duration: 5000,
        });
      }
    } catch (err) {
      // Handle unexpected errors
      console.error("Form submission error:", err);

      // Check if it's a network error
      if (err instanceof TypeError && err.message.includes("fetch")) {
        toast.error("Network error", {
          description: "Please check your internet connection and try again.",
          duration: 5000,
        });
      } else {
        toast.error("An unexpected error occurred", {
          description:
            "Please try again. If the problem persists, contact support.",
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    form.setValue("tags", tags);
  };

  const handleTypeChange = (value: string) => {
    const newType = value as typeof snippetType;
    setSnippetType(newType);
    form.setValue("type", newType);
    // Clear type-specific fields when switching types
    if (newType !== "code") {
      form.setValue("language", "");
      form.setValue("framework", "");
    }
    if (newType !== "text" && newType !== "code") {
      form.setValue("content", "");
    }
    if (newType !== "command") {
      form.setValue("command", "");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={snippetType} onValueChange={handleTypeChange}>
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

        {/* Common Fields */}
        <CommonFields form={form} onTagsChange={handleTagsChange} />

        {/* Code Snippet Fields */}
        <TabsContent value="code" className="space-y-4">
          <CodeSnippetFields form={form} />
        </TabsContent>

        {/* Text Snippet Fields */}
        <TabsContent value="text" className="space-y-4">
          <TextSnippetFields form={form} />
        </TabsContent>

        {/* Command Snippet Fields */}
        <TabsContent value="command" className="space-y-4">
          <CommandSnippetFields form={form} />
        </TabsContent>
      </Tabs>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Snippet"
          )}
        </Button>
      </div>
    </form>
  );
}
