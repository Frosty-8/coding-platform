import express from "express";
import cors from "cors";
import { executePython } from "./utils/executePython.js";
import { executeJS } from "./utils/executeJS.js";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

  if (!language || !code) {
    return res.status(400).json({ error: "Language and code required" });
  }

  try {
    let result;

    if (language === "python") {
      result = await executePython(code, input);
    } else if (language === "javascript") {
      result = await executeJS(code, input);
    } else {
      return res.status(400).json({ error: "Unsupported language" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/run-tests", async (req, res) => {
  const { questionId, language, code } = req.body;

  if (!questionId || !language || !code) {
    return res.status(400).json({ error: "questionId, language and code are required" });
  }

  const q = questionsData.find((x) => x.id === Number(questionId));
  if (!q) return res.status(404).json({ error: "Question not found" });

  const normalize = (str) => str.trim().replace(/\r/g, "");

  const results = [];

  for (let i = 0; i < q.tests.length; i++) {
    const t = q.tests[i];

    try {
      let runResult;

      if (language === "python") {
        runResult = await executePython(code, t.input);
      } else if (language === "javascript") {
        runResult = await executeJS(code, t.input);
      } else {
        return res.status(400).json({ error: "Unsupported language" });
      }

      const output = normalize(runResult.output || "");
      const expected = normalize(t.expectedOutput || "");

      results.push({
        index: i,
        input: t.input,
        expectedOutput: expected,
        output,
        pass: output === expected,
        stderr: runResult.stderr || "",
      });

    } catch (err) {
      results.push({
        index: i,
        input: t.input,
        expectedOutput: t.expectedOutput || "",
        output: "",
        pass: false,
        stderr: err.message,
      });
    }
  }

  const passed = results.filter((r) => r.pass).length;

  res.json({
    questionId,
    total: q.tests.length,
    passed,
    results,
  });
});

app.get("/", (req, res) => {
  res.send("Mini Piston Backend Running 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});