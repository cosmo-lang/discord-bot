import { EmbedBuilder, Message } from "discord.js";

export function helpCommand(message: Message<boolean>) {
  message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Help Menu")
        .setDescription("This bot has exactly one command. That command is `$cosmo`. The `$cosmo` command is to be executed with a code block. The given code block will then be interpreted by Cosmo. For example:\n\n$cosmo ```\nmy code here\n```")
        .setColor("Blue")
        .setTimestamp()
    ]
  });
}
