
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import pino from "pino";
import readline from "readline";
import qrcode from "qrcode-terminal";

import { config } from "./config.js";
import { handleCommand } from "./commands.js";
import { getMessageText } from "./lib/functions.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (text) =>
  new Promise(resolve => rl.question(text, resolve));

let reconnecting = false;

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: [config.BOT_NAME, "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Scan this QR code:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "connecting") {
      console.log("METHU MD Connecting...");
    }

    if (connection === "open") {
      console.log("METHU MD Connected Successfully! 💜");
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;

      if (
        statusCode !== DisconnectReason.loggedOut &&
        !reconnecting
      ) {
        reconnecting = true;

        console.log("Reconnecting METHU MD...");

        setTimeout(async () => {
          reconnecting = false;
          await startBot();
        }, 3000);
      } else if (statusCode === DisconnectReason.loggedOut) {
        console.log("Session logged out. Login again.");
      }
    }
  });

  if (!state.creds.registered) {
    const method = await question(
      "Choose Login: 1 = Pairing Code, 2 = QR Code: "
    );

    if (method.trim() === "1") {
      const number = await question(
        "Enter WhatsApp number with country code: "
      );

      const code = await sock.requestPairingCode(
        number.replace(/[^0-9]/g, "")
      );

      console.log("METHU MD PAIRING CODE:", code);
    } else if (method.trim() === "2") {
      console.log("Waiting for QR code...");
    } else {
      console.log("Invalid option. Restart the bot.");
    }

    rl.close();
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const text = getMessageText(msg);

      if (!text) continue;

      try {
        await handleCommand(sock, msg, text);
      } catch (error) {
        console.error("Command Error:", error);
      }
    }
  });
}

startBot().catch(console.error);
