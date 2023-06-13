import { Client, EmbedBuilder, IntentsBitField, Message } from "discord.js";
import { configDotenv as configEnv } from "dotenv";
import { exec } from "child_process";
import * as fs from "fs";

configEnv();
const client = new Client({
  intents: [
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent
  ]
});

function displayError(message: Message, title: string, description: string): void {
  const embed = new EmbedBuilder()
    .setTitle("Error: " + title)
    .setDescription(description)
    .setColor("Red")
    .setTimestamp();

  message.reply({ embeds: [ embed ] });
}

client.on("ready", () => console.log("Application online!"));
client.on("error", console.warn);

client.on("messageCreate", message => {
  const args = message.content.split(" ");
  const command = args.shift();
  if (command?.toLowerCase() != "$cosmo") return;

  const codeblock = args.join(" ");
  if (!codeblock.startsWith("```") || !codeblock.endsWith("```"))
    return displayError(message, "Cannot execute", "Invalid code block");

  const bodyLines = codeblock.split("\n");
  bodyLines.shift();
  bodyLines.pop();

  const body = bodyLines.join("\n");
  if (body.includes("exec") && body.includes("from \"system\""))
    return displayError(message, "Cannot execute", "System->exec is not allowed for security purposes");

  fs.writeFileSync("main.⭐", body);
  exec("cosmo main.⭐", (ex, out) => {
    const ansiEscapeRegex = /\x1B\[[0-9;]*[mG]/g;
    const embed = new EmbedBuilder()
      .setTitle("Output")
      .setDescription(`\`\`\`${ex?.message ?? out.replace(ansiEscapeRegex, "")}\`\`\``)
      .setColor("Green")
      .setTimestamp();

    message.reply({ embeds: [ embed ] });
  });
});

client.login(process.env.TOKEN);