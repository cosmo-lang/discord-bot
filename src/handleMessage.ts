import { EmbedBuilder, Message } from "discord.js";
import { executeWithTimeout } from "./executeWithTimeout";
import * as fs from "fs";

function displayError(message: Message, title: string, description: string, replyMessage?: Message): void {
  replyMessage?.delete();
  message.reply({ embeds: [
    new EmbedBuilder()
      .setTitle("Error: " + title)
      .setDescription(description)
      .setColor("Red")
      .setTimestamp()
  ] });
}

const isWhitespace = (content: string): boolean =>
  /^\s*$/.test(content)

// Removes ANSI escape sequences and wraps with ```
const wrapCodeblock = (text: string): string => {
  text = text.replace(/\x1B\[[0-9;]*[mG]/g, "");
  if (isWhitespace(text))
    text = "(empty)";

  return `\`\`\`${text}\`\`\``;
}

export async function handleMessage(message: Message): Promise<void> {
  const args = message.content.split(" ");
  const command = args.shift();
  if (!command) return;

  if (command.toLowerCase() === "$help") {
    message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Help Menu")
          .setDescription("This bot has exactly one command. That command is `$cosmo`. `$cosmo` is to be executed with a code block. The given code block will then be interpreted by Cosmo. For example:\n\n$cosmo ```\nmy code here\n```")
          .setColor("Blue")
          .setTimestamp()
      ]
    });
  } else if (command.toLowerCase() === "$cosmo") {
    const codeblock = args.join(" ");
    if (!codeblock.startsWith("```") || !codeblock.endsWith("```"))
      return displayError(message, "Cannot execute", "Invalid code block.");

    const bodyLines = codeblock.split("\n");
    bodyLines.shift();
    bodyLines.pop();

    const body = bodyLines.join("\n");
    if (body.includes("exec") && body.includes("from \"system\""))
      return displayError(message, "Cannot execute", "System->exec is not allowed for security purposes.");

    if (isWhitespace(body))
      return displayError(message, "Cannot execute", "Code block is empty.");

    const reply = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Loading...")
          .setColor("Yellow")
      ]
    });

    const timeout = 20000;
    fs.writeFileSync("main.⭐", body);
    executeWithTimeout("cosmo main.⭐", timeout)
      .then(out => {
        reply.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle("Output (Success)")
              .setDescription(wrapCodeblock(out))
              .setColor("Green")
              .setTimestamp()
          ]
        });
      })
      .catch(ex => {
        if (typeof ex === "string")
          reply.edit({
            embeds: [
              new EmbedBuilder()
                .setTitle("Output (Error)")
                .setDescription(wrapCodeblock(ex))
                .setColor("Red")
                .setTimestamp()
            ]
          });
        else
          return displayError(message, "Timeout", `Execution timed out because it exceeded execution time of ${timeout / 1000} seconds.`, reply);
      });
  }
}
