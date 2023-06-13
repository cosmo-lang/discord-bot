import { Message } from "discord.js";
import { helpCommand } from "./helpCommand";
import cosmoCommand from "./cosmoCommand";

export async function handleMessage(message: Message): Promise<void> {
  const args = message.content.split(" ");
  let command = args.shift();
  if (!command) return;

  switch (command.toLowerCase()) {
    case "$help":
      helpCommand(message);
      break;
    case "$cosmo":
      cosmoCommand(message, args);
      break;
  }
}

