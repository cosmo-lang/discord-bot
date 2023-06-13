import { exec, ExecException } from "child_process";

export class TimeoutError extends Error {}

export function executeWithTimeout(command: string, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = exec(command, (ex: ExecException | null, out: string) => {
      if (ex)
        reject(ex.message);
      else
        resolve(out);
    });

    const timeoutId = setTimeout(() => {
      child.kill();
      reject(new TimeoutError);
    }, timeout);

    child.on("close", () => clearTimeout(timeoutId));
  });
}