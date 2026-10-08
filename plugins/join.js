const handler = async (m, { conn, text, bot }) => {
  if (!m.isOwner) {
    const ownerJid = bot?.config?.owners[0]?.jid
    m.reply("`حاضر ايها العميل 🎭 تم ارسال طلبك للمطور  `")
    await conn.sendMessage(ownerJid, { text: `🔔 *طلب دخول جروب*\nمن: @${m.sender.split("@")[0]}\nالرابط: ${text || "لم يرسل رابط"}`, mentions: [m.sender] });
    return m.reply("حاضر ايها العميل 🎭 تم ارسال طلبك للمطور 🧑‍💻");
  }

  if (!text) return m.reply("اعني رابط حروب واتساب يا سيدي 🎭");
  if (!text.includes("https://chat.whatsapp.com/")) return m.reply("واتس فقط يا سيدي 🪀");

  m.react("🤞");
  await conn.groupJoin(text);
  m.reply("حلضر سيدي لقد تم الدخول 🪀");
};

handler.usage = ["انضم"];
handler.category = "group";
handler.command = ["انضم", "ادخل"];

export default handler;