import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { GameState } from "$lib/chess";

type BotMove = {
  from: [number, number];
  to: [number, number];
  promotion?: string;
};

export function getBotMove(state: GameState): Promise<BotMove> {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const extension = process.env.NODE_ENV === "production" ? ".js" : ".ts";
    const botProcessPath = path.join(__dirname, "bot-process" + extension);

    console.log("[Bot] Spawning process at:", botProcessPath);
    console.log("[Bot] Process exists:", require("fs").existsSync(botProcessPath));

    const child = spawn("bun", ["run", botProcessPath], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";

    child.stdin.write(JSON.stringify(state));
    child.stdin.end();

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error("[Bot Process] stderr:", data.toString());
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Bot process exited with code ${code}: ${errorOutput}`));
      } else {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse bot result: ${output}`));
        }
      }
    });

    child.on("error", (error) => {
      reject(new Error(`Failed to spawn bot process: ${error.message}`));
    });

    setTimeout(() => {
      child.kill();
      reject(new Error("Bot calculation timeout"));
    }, 5000);
  });
}