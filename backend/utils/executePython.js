import { exec } from "child_process";
import fs from "fs";
import { v4 as uuid } from "uuid";

export const executePython = (code, input = "") => {
  return new Promise((resolve) => {
    const filePath = `temp/${uuid()}.py`;

    fs.writeFileSync(filePath, code);

    const pythonCmd = process.platform === "win32" ? "python" : "python3";

    const processExec = exec(`${pythonCmd} ${filePath}`, { timeout: 3000 }, (err, stdout, stderr) => {

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (err) {
        return resolve({
          output: "",
          stderr: stderr || "Execution Error",
        });
      }

      resolve({
        output: stdout.trim(),
        stderr: stderr.trim(),
      });
    });

    if (input) {
      processExec.stdin.write(input);
      processExec.stdin.end();
    }
  });
};