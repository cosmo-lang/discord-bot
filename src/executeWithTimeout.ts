import { exec, ExecException } from "child_process";

export class TimeoutError extends Error {}

export function executeWithTimeout(command: string, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = exec(command, (ex: ExecException | null, out: string) => {
      if (ex !== null)
        reject(ex.message);
      else {
        const lines = out.split("\n");
        lines.shift();
        resolve(lines.join("\n").trim());
      }
    });

    const timeoutId = setTimeout(() => {
      child.kill();
      reject(new TimeoutError);
    }, timeout);

    child.on("close", () => clearTimeout(timeoutId));
  });
}