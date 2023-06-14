import { exec, ExecException } from "child_process";

export class TimeoutError extends Error {}

export function executeWithTimeout(command: string, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = exec(command, (ex: ExecException | null, out: string) => {
      const failed = ex !== null;
      const lines = (failed ? ex.message : out)
        .trim()
        .split("\n");

      if (failed) {
        lines.shift();
        reject(lines.join("\n"));
      } else
        resolve(lines.join("\n"));
    });

    const handle = setTimeout(() => {
      child.kill();
      reject(new TimeoutError);
    }, timeout);

    child.on("close", () => clearTimeout(handle));
  });
}