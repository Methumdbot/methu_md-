
export function getMessageText(message) {
  const msg = message?.message;

  return (
    msg?.conversation ||
    msg?.extendedTextMessage?.text ||
    msg?.imageMessage?.caption ||
    msg?.videoMessage?.caption ||
    msg?.documentMessage?.caption ||
    ""
  );
}

export function getSender(message) {
  return (
    message?.key?.participant ||
    message?.key?.remoteJid ||
    ""
  );
}

export function isGroup(message) {
  return message?.key?.remoteJid?.endsWith("@g.us") || false;
}

export function isOwner(sender, ownerNumber) {
  const number = sender.split("@")[0];
  return number === ownerNumber.replace(/[^0-9]/g, "");
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

export function getPrefix(text, prefix = ".") {
  return text.startsWith(prefix);
}
