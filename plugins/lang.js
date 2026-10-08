// noureddine ouafy 
const handler = async (m, { args }) => {
	const lang = (args[0] || '').toLowerCase()

	if (!['ar', 'fr', 'en'].includes(lang)) {
		return m.reply('Usage: .lang ar | fr | en\nMisal: .lang ar')
	}

	global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
	global.db.data.users[m.sender].lang = lang

	const confirm = {
		ar: '✅ تم تغيير لغة القائمة إلى العربية.',
		fr: '✅ La langue du menu a été changée en français.',
		en: '✅ Menu language set to English.',
	}

	m.reply(confirm[lang])
}

handler.help = ['lang']
handler.tags = ['infobot']
handler.command = /^lang$/i
export default handler
