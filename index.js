
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import pino from "pino";
import readline from "readline";

const BOT_NAME = "METHU MD";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (text) =>
  new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: [BOT_NAME, "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "connecting") {
      console.log("METHU MD Connecting...");
    }

    if (connection === "open") {
      console.log("METHU MD Bot Connected Successfully!");
      rl.close();
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;

      if (statusCode !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log("Session logged out. Login again.");
      }
    }
  });

  if (!sock.authState.creds.registered) {
    const phoneNumber = await question(
      "Enter WhatsApp number with country code: "
    );

    const code = await sock.requestPairingCode(
      phoneNumber.replace(/[^0-9]/g, "")
    );

    console.log("METHU MD PAIRING CODE:", code);
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (text.toLowerCase() === ".ping") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "METHU MD Bot is Online! 🚀"
      });
    }
  });
}

startBot().catch(console.error);
