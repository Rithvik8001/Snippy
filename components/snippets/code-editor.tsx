"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  className?: string;
  readOnly?: boolean;
}

const languageMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  sql: "sql",
  markdown: "markdown",
  rust: "rust",
  java: "java",
  cpp: "cpp",
  c: "c",
  go: "go",
  bash: "shell",
  shell: "shell",
  dockerfile: "dockerfile",
  yaml: "yaml",
  php: "php",
  ruby: "ruby",
  swift: "swift",
  kotlin: "kotlin",
  csharp: "csharp",
  other: "plaintext",
};

export function CodeEditor({
  value,
  onChange,
  language,
  className,
  readOnly = false,
}: CodeEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const monaco = useMonaco();

  const isDark = resolvedTheme === "dark" || theme === "dark";

  const monacoLanguage = language
    ? languageMap[language] || "typescript"
    : "typescript";

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("custom-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#0a0a0a",
          "editorWidget.background": "#1a1a1a",
          "editorWidget.border": "#2a2a2a",
          "dropdown.background": "#1a1a1a",
          "dropdown.border": "#2a2a2a",
          "list.background": "#1a1a1a",
          "list.hoverBackground": "#2a2a2a",
          "input.background": "#1a1a1a",
          "input.border": "#2a2a2a",
        },
      });

      monaco.editor.defineTheme("custom-light", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#ffffff",
        },
      });
    }
  }, [monaco]);

  useEffect(() => {
    if (monaco && isDark) {
      monaco.editor.setTheme("custom-dark");
    } else if (monaco && !isDark) {
      monaco.editor.setTheme("custom-light");
    }
  }, [monaco, isDark]);

  return (
    <div className={className} style={{ position: "relative", zIndex: 1 }}>
      <div
        className="rounded-md border border-border"
        style={{ overflow: "visible" }}
      >
        <Editor
          height="300px"
          language={monacoLanguage}
          value={value}
          onChange={readOnly ? undefined : (val) => onChange?.(val || "")}
          theme={isDark ? "custom-dark" : "custom-light"}
          options={{
            colorDecorators: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
                readOnly: readOnly,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
            bracketPairColorization: { enabled: true },
            matchBrackets: "always",
            folding: true,
            foldingStrategy: "indentation",
            showFoldingControls: "always",
            renderWhitespace: "selection",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: 8, bottom: 8 },
            fixedOverflowWidgets: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
          loading={
            <div className="flex h-[300px] items-center justify-center bg-muted">
              <div className="text-sm text-muted-foreground">
                Loading editor...
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
