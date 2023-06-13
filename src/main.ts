import { ActivityType, Client, EmbedBuilder, IntentsBitField, Message } from "discord.js";
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

client.on("error", console.warn);
client.on("ready", () => {
  console.log("Application online!");
  exec("cosmo -v", (ex, out) =>
    client.user?.setActivity({
      name: `$help | ${out}`,
      type: ActivityType.Watching
    })
  );
});

client.on("messageCreate", async message => {
  const args = message.content.split(" ");
  const command = args.shift();
  if (!command) return;

  if (command.toLowerCase() == "$help") {
    message.reply({ embeds: [
      new EmbedBuilder()
        .setTitle("Help Menu")
        .setDescription("This bot has exactly one command. That command is `$cosmo`. `$cosmo` is to be executed with a code block. The given code block will then be interpreted by Cosmo. For example:\n\n$cosmo ```\nmy code here\n```")
        .setColor("Blue")
        .setTimestamp()
    ] });
  } else if (command.toLowerCase() == "$cosmo") {
    const codeblock = args.join(" ");
    if (!codeblock.startsWith("```") || !codeblock.endsWith("```"))
      return displayError(message, "Cannot execute", "Invalid code block");

    const bodyLines = codeblock.split("\n");
    bodyLines.shift();
    bodyLines.pop();

    const body = bodyLines.join("\n");
    if (body.includes("exec") && body.includes("from \"system\""))
      return displayError(message, "Cannot execute", "System->exec is not allowed for security purposes");

    const reply = await message.reply({ embeds: [
      new EmbedBuilder()
        .setTitle("Loading...")
        .setColor("Yellow")
    ] });

    // TODO: add process timeout
    fs.writeFileSync("main.⭐", body);
    exec("cosmo main.⭐", (ex, out) => {
      const ansiEscapeRegex = /\x1B\[[0-9;]*[mG]/g;
      reply.edit({ embeds: [
        new EmbedBuilder()
          .setTitle("Output")
          .setDescription(`\`\`\`${ex?.message ?? out.replace(ansiEscapeRegex, "")}\`\`\``)
          .setColor("Green")
          .setTimestamp()
      ] });
    });
  }
});

client.login(process.env.TOKEN);