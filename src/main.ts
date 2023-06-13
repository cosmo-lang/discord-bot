import { ActivityType, Client, IntentsBitField } from "discord.js";
import { configDotenv as configEnv } from "dotenv";
import { executeWithTimeout } from "./executeWithTimeout";
import { handleMessage } from "./handleMessage";

configEnv();
const client = new Client({
  intents: [
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent
  ]
});

// better logging later
const exception = console.warn;
client.on("error", exception);
client.on("ready", () => {
  console.log("Application online!");
  executeWithTimeout("cosmo -v", 2000)
    .then(out => client.user?.setActivity({
      name: `$help | ${out}`,
      type: ActivityType.Watching
    })).catch(exception);
});

client.on("messageCreate", handleMessage);
client.login(process.env.TOKEN);
