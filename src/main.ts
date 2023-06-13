import { Client } from "discord.js";
import { configDotenv as configEnv } from "dotenv";
import { exec } from "child_process";
import * as fs from "fs";

configEnv();
const client = new Client({
  intents: ["MessageContent"]
});

client.on("ready", () => console.log("Application online!"));
client.on("error", console.error);
client.on("messageCreate", message => {
  const args = message.content.split(" ");
  const command = args.shift();
  if (command != "$cosmo") return;

  const codeblock = args.join(" ");
  if (!codeblock.startsWith("```") || !codeblock.endsWith("```")) {
    message.reply("Cannot execute: Invalid code block");
    return;
  }

  const bodyLines = codeblock.split("\n");
  bodyLines.shift();
  bodyLines.pop();

  const body = bodyLines.join("\n");
  fs.writeFileSync("main.⭐", body)
  const proc = exec("cosmo main.⭐");
  message.reply(`Output: ${proc.stderr?.read() || proc.stdout?.read()}`)
});