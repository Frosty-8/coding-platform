import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, onChange, language, dark = true }) {
  return (
    <Editor
      height="100%"
      language={language}
      theme={dark ? "vs-dark" : "vs-light"}
      value={code}
      onChange={(value) => onChange(value || "")}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        roundedSelection: true,
        cursorStyle: "line",
        fontFamily: "'Fira Code', 'Consolas', monospace",
      }}
    />
  );
}