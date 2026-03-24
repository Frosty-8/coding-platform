import { exec } from "child_process";
import fs from "fs";
import { v4 as uuid } from "uuid";

export const executeJS = (code, input = "") => {
  return new Promise((resolve) => {
    const filePath = `temp/${uuid()}.js`;

    fs.writeFileSync(filePath, code);

    const processExec = exec(`node ${filePath}`, { timeout: 3000 }, (err, stdout, stderr) => {

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