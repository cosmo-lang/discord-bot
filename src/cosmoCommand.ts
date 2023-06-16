import { EmbedBuilder, Message } from "discord.js";
import { executeWithTimeout } from "./executeWithTimeout";
import * as fs from "fs";

const DISALLOWED_IMPORTS = new Map<string, string[] | true>([
  ["system", ["exec"]],
  ["http", ["Server"]],
  ["file", true]
]);

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

function displayOutput(type: "Error" | "Success", reply: Message, content: string) {
  let strippedContent = content.replace(/\x1B\[[0-9;]*[mG]/g, "");
  if (isWhitespace(strippedContent))
    strippedContent = "(empty)";

  reply.edit({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Output (${type})`)
        .setDescription(`\`\`\`\n${strippedContent}\`\`\``)
        .setColor(type === "Error" ? "Red" : "Green")
        .setTimestamp()
    ]
  });
}

export default async function cosmoCommand(message: Message, args: string[]): Promise<void> {
  const codeblock = args.join(" ");
  if (!codeblock.startsWith("```") || !codeblock.endsWith("```"))
    return displayError(message, "Cannot execute", "Invalid code block.");

  const bodyLines = codeblock.split("\n");
  bodyLines.shift();
  bodyLines.pop();

  const body = bodyLines.join("\n");
  for (const [libName, disallowed] of DISALLOWED_IMPORTS) {
    if (body.includes(`from "${libName}"`)) {
      const title = "Cannot execute, disallowed import";
      if (disallowed === true)
        return displayError(message, title, `The "${libName}" module is not allowed for security purposes.`);
      for (const member of disallowed)
        if (body.includes(member))
          return displayError(message, title, `The import "${member}" from "${libName}" is not allowed for security purposes.`);
    }
  }

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
    .then(out => displayOutput("Success", reply, out))
    .catch(ex => {
      if (typeof ex === "string")
        displayOutput("Error", reply, ex);
      else
        displayError(message, "Timeout", `Execution timed out because it exceeded execution time of ${timeout / 1000} seconds.`, reply);
    });
}
