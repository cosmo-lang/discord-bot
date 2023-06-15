import { EmbedBuilder, Message } from "discord.js";

const description = `
This bot has exactly one command. That command is \`$cosmo\`. Here is some information about it:
- It is to be executed with a code block.
- You must include a space between \`$cosmo\` and the codeblock.
- You must add a new line after the first triple backtick (\`\`\`).
- The codeblock must use the [triple backtick (\`\`\`) syntax](https://www.technipages.com/discord-code-blocks/#attachment_55311).
- Example:

$cosmo \`\`\`
puts("Hello, world!")
\`\`\`
`

export function helpCommand(message: Message<boolean>) {
  message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Help Menu")
        .setDescription(description)
        .setColor("Blue")
        .setTimestamp()
    ]
  });
}
