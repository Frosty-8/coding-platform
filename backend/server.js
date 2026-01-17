import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const LANGUAGES = {
  python: "3.10.0",
  javascript: "18.15.0",
  java: "15.0.2",
  cpp: "10.2.0",
  c: "10.2.0",
};

const __dirname = path.resolve();
const questionsPath = path.join(__dirname, "questions.json");
const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

app.get("/questions", (req, res) => {
  res.json(questionsData);
});

app.get("/questions/:id", (req, res) => {
  const id = Number(req.params.id);
  const q = questionsData.find((x) => x.id === id);
  if (!q) return res.status(404).json({ error: "Question not found" });
  res.json(q);
});

app.post("/run", async (req, res) => {
  const { language, code, input } = req.body;
  if (!language || !code) return res.status(400).json({ error: "Language and code are required" });
  if (!LANGUAGES[language]) return res.status(400).json({ error: "Unsupported language" });

  const payload = {
    language,
    version: LANGUAGES[language],
    files: [{ content: code }],
    stdin: input || "",
  };

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", payload);
    const runData = response.data.run || {};
    res.json({
      output: (runData.output || "").trim(),
      stderr: (runData.stderr || "").trim(),
      code: runData.code,
      signal: runData.signal,
    });
  } catch (err) {
    console.error("Piston API error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: "Code execution failed" });
  }
});

app.post("/run-tests", async (req, res) => {
  const { questionId, language, code } = req.body;
  if (!questionId || !language || !code) {
    return res.status(400).json({ error: "questionId, language and code are required" });
  }
  if (!LANGUAGES[language]) return res.status(400).json({ error: "Unsupported language" });

  const q = questionsData.find((x) => x.id === Number(questionId));
  if (!q) return res.status(404).json({ error: "Question not found" });

  const tests = Array.isArray(q.tests) ? q.tests : [];
  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const payload = {
      language,
      version: LANGUAGES[language],
      files: [{ content: code }],
      stdin: t.input ?? "",
    };
    try {
      const resp = await axios.post("https://emkc.org/api/v2/piston/execute", payload);
      const runData = resp.data.run || {};
      const out = (runData.output || "").trim();
      const expected = (t.expectedOutput || "").trim();
      results.push({
        index: i,
        input: t.input,
        expectedOutput: expected,
        output: out,
        pass: out === expected,
        stderr: (runData.stderr || "").trim(),
      });
    } catch (e) {
      results.push({
        index: i,
        input: t.input,
        expectedOutput: t.expectedOutput || "",
        output: "",
        pass: false,
        stderr: e.response?.data || e.message,
      });
    }
  }

  const passed = results.filter((r) => r.pass).length;
  res.json({ questionId, total: tests.length, passed, results });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

export default app;