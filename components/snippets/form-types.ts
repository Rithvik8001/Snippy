export type SnippetFormData = {
  type: "code" | "text" | "command";
  title: string;
  tags: string[];
  content?: string;
  language?: string;
  framework?: string;
  command?: string;
};
