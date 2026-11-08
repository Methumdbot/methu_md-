
const BOT_NAME = "METHU MD";
const PREFIX = ".";

export async function handleCommand(sock, msg, text) {
  const jid = msg.key.remoteJid;

  if (!text.startsWith(PREFIX)) return;

  const args = text.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  switch (command) {
    case "ping":
      await sock.sendMessage(jid, {
        text: "🏓 Pong!\nMETHU MD is Online! 🚀"
      });
      break;

    case "alive":
      await sock.sendMessage(jid, {
        text: `╭━━━〔 ${BOT_NAME} 〕━━━╮
┃
┃ ✅ Bot Status: Online
┃ 🤖 Bot Name: METHU MD
┃ ⚡ Version: 1.0.0
┃
╰━━━━━━━━━━━━━━━━━━╯`
      });
      break;

    case "menu":
    case "help":
      await sock.sendMessage(jid, {
        text: `╭━━━〔 ${BOT_NAME} 〕━━━╮
┃
┃ 1. .ping
┃ 2. .alive
┃ 3. .menu
┃ 4. .help
┃
╰━━━━━━━━━━━━━━━━━━╯
❤️ Powered by METHU MD`
      });
      break;

    default:
      break;
  }
}
