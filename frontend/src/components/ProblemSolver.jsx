import React, { useState, useEffect } from "react";
import axios from "axios";
import CodeEditor from "./CodeEditor";
import { CheckCircle, XCircle, Terminal, Code, RotateCcw } from "lucide-react";

const LANGUAGES = ["python", "javascript", "java", "cpp", "c"];

export default function ProblemSolver({ dark }) {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("input");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/questions`)
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedQuestion && questions.length > 0) {
      setSelectedQuestion(questions[0]);
    }
  }, [questions]);

  useEffect(() => {
    if (selectedQuestion) {
      setInput(selectedQuestion.defaultInput || "");
      setResults(null);
      setOutput("");
      setCode(selectedQuestion.starterCode?.[language] || "");
    }
  }, [selectedQuestion, language]);

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/run`, {
        language,
        code,
        input,
      });
      setOutput(res.data.output || res.data.stderr || "No output");
    } catch (err) {
      setOutput(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedQuestion) return;
    setLoading(true);
    setOutput("");
    setResults(null);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/run-tests`,
        {
          questionId: selectedQuestion.id,
          language,
          code,
        }
      );
      setResults(res.data);
      setActiveTab("results");
    } catch (err) {
      setOutput(err.response?.data?.error || err.message);
      setActiveTab("output");
    }
    setLoading(false);
  };

  const resetCode = () => {
    if (selectedQuestion?.starterCode?.[language]) {
      setCode(selectedQuestion.starterCode[language]);
    } else {
      setCode("");
    }
  };

  return (
    <div className="grid h-[calc(100vh-5rem)] grid-cols-12 gap-5 p-5">
      {/* Sidebar - Problems List */}
      <aside className="col-span-3 border rounded-xl bg-card overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Problems</h3>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuestion(q)}
              className={`
                w-full text-left p-3 rounded-lg mb-1 transition-colors
                ${
                  selectedQuestion?.id === q.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }
              `}
            >
              <div className="font-medium truncate">{q.title}</div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    q.difficulty === "Easy"
                      ? "bg-green-500/20 text-green-400"
                      : q.difficulty === "Hard"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {q.difficulty || "Medium"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="col-span-9 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {selectedQuestion?.title || "Select a problem"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedQuestion?.description?.substring(0, 120)}...
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={resetCode}
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md hover:bg-muted transition-colors text-sm"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Editor + Terminal Area */}
        <div className="flex-1 grid grid-rows-[1fr_auto] gap-4 min-h-0">
          {/* Code Editor */}
          <div className="border rounded-xl overflow-hidden bg-editor-bg shadow-sm">
            <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between text-sm">
              <span className="font-medium">Solution</span>
              <span className="text-muted-foreground">
                {code.split("\n").length} lines
              </span>
            </div>
            <div className="h-[calc(100%-2.5rem)]">
              <CodeEditor
                code={code}
                onChange={setCode}
                language={language}
                dark={dark}
              />
            </div>
          </div>

          {/* Terminal / Results Area */}
          <div className="border rounded-xl overflow-hidden bg-terminal-bg flex flex-col">
            <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-4">
              <button
                onClick={() => setActiveTab("input")}
                className={`flex items-center gap-1.5 px-3 py-1 text-sm transition-colors ${
                  activeTab === "input"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Terminal size={14} />
                Input
              </button>

              <button
                onClick={() => setActiveTab("output")}
                className={`flex items-center gap-1.5 px-3 py-1 text-sm transition-colors ${
                  activeTab === "output"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Output
              </button>

              <button
                onClick={() => setActiveTab("results")}
                className={`flex items-center gap-1.5 px-3 py-1 text-sm transition-colors ${
                  activeTab === "results"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Test Results
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-sm">
              {activeTab === "input" && (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-full bg-transparent resize-none focus:outline-none"
                  placeholder="Enter custom input here..."
                />
              )}

              {activeTab === "output" && (
                <pre className="whitespace-pre-wrap h-full">{output || "Run your code to see output..."}</pre>
              )}

              {activeTab === "results" && results && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">
                      {results.passed}/{results.total} tests passed
                    </h4>
                    <div className="text-sm">
                      {Math.round((results.passed / results.total) * 100)}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    {results.results.map((test) => (
                      <div
                        key={test.index}
                        className={`p-3 rounded border ${
                          test.pass
                            ? "bg-green-950/30 border-green-800"
                            : "bg-red-950/30 border-red-800"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {test.pass ? (
                            <CheckCircle className="text-green-500 mt-0.5" size={18} />
                          ) : (
                            <XCircle className="text-red-500 mt-0.5" size={18} />
                          )}

                          <div className="flex-1">
                            <div className="font-medium">Test Case {test.index + 1}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Input:
                            </div>
                            <pre className="mt-1 bg-black/30 p-2 rounded text-xs overflow-x-auto">
                              {test.input}
                            </pre>

                            {!test.pass && (
                              <>
                                <div className="text-xs text-muted-foreground mt-2">
                                  Expected vs Your Output:
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-1">
                                  <pre className="bg-black/30 p-2 rounded text-xs overflow-x-auto">
                                    {test.expectedOutput}
                                  </pre>
                                  <pre className="bg-black/30 p-2 rounded text-xs overflow-x-auto">
                                    {test.output}
                                  </pre>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "results" && !results && (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Submit your code to run all test cases
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t bg-muted/50 px-4 py-3 flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={loading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Running..." : "Run Code"}
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || !selectedQuestion}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>

              <button
                onClick={() => {
                  setCode("");
                  setOutput("");
                  setResults(null);
                  setActiveTab("input");
                }}
                className="px-4 py-2 border rounded-md hover:bg-muted transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}