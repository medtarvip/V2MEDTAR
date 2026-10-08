import moment from 'moment-timezone'
import os from 'os'

const NEW_DAYS = 30
const STATUS_CACHE_MS = 5 * 60 * 1000

// تحويل الأحرف الإنجليزية والأرقام إلى Bold Unicode
function toBoldUnicode(str) {
	const bold = {
		a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',
		k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',
		u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',
		A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',
		K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',
		U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',
		0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗',
	}

	return str.split('').map(c => bold[c] || c).join('')
}

// رموز الأقسام
const categoryColors = {
	main: '🔵',
	ai: '🟣',
	downloader: '🟢',
	uploader: '🟢',
	editor: '🟠',
	sticker: '🟡',
	tools: '⚪',
	infobot: '🔵',
	group: '🟢',
	owner: '🔴',
	games: '🟤',
}

// ==================== اللغات ====================

const translations = {
	en: {
		prefix: 'Prefix',
		uptime: 'Uptime',
		ram: 'RAM',
		status: 'Status',
		commands: 'Commands',
		plugins: 'Plugins',
		users: 'Users',
		views: 'Menu Views',
		tapMenu: '✦ Tap 📂 below to switch category',
		notFound: 'Category not found, showing full menu.',
		empty: '(empty)',
		whatsNew: "What's New",
		newDesc: 'Commands added in the last',
		days: 'days',
		noNew: '(no new commands right now)',
		tips: [
			'💡 Tip: type .menu <category> to jump to a section.',
			'💡 Tip: 🆕 means the command was added recently.',
			'💡 Tip: 🔥 marks popular commands.',
			'💡 Tip: 🔒 means the command has a usage limit.',
			'💡 Tip: 💎 means the command is premium.',
			'💡 Tip: type .menu new to see recent commands.',
			'💡 Tip: type .lang ar|fr|en to change the menu language.',
		],
	},

	ar: {
		prefix: 'البادئة',
		uptime: 'مدة التشغيل',
		ram: 'الذاكرة',
		status: 'الحالة',
		commands: 'الأوامر',
		plugins: 'الإضافات',
		users: 'المستخدمون',
		views: 'المشاهدات',
		tapMenu: '✦ اختر قسماً من القائمة بالأسفل',
		notFound: 'القسم غير موجود، تم عرض القائمة الكاملة.',
		empty: '(فارغ)',
		whatsNew: 'الجديد',
		newDesc: 'الأوامر المضافة خلال آخر',
		days: 'يوم',
		noNew: '(لا توجد أوامر جديدة حالياً)',
		tips: [
			'💡 اكتب .menu <القسم> للوصول مباشرة إلى قسم معين.',
			'💡 الرمز 🆕 يعني أن الأمر تمت إضافته مؤخراً.',
			'💡 الرمز 🔥 يميز الأوامر الشائعة.',
			'💡 الرمز 🔒 يعني أن للأمر حد استخدام.',
			'💡 الرمز 💎 يعني أن الأمر مخصص للمميزين.',
			'💡 اكتب .menu new لرؤية الأوامر الجديدة.',
			'💡 اكتب .lang ar|fr|en لتغيير لغة القائمة.',
		],
	},

	fr: {
		prefix: 'Préfixe',
		uptime: 'Uptime',
		ram: 'RAM',
		status: 'Statut',
		commands: 'Commandes',
		plugins: 'Plugins',
		users: 'Utilisateurs',
		views: 'Vues',
		tapMenu: '✦ Choisissez une catégorie ci-dessous',
		notFound: 'Catégorie introuvable, menu complet affiché.',
		empty: '(vide)',
		whatsNew: 'Nouveautés',
		newDesc: 'Commandes ajoutées ces derniers',
		days: 'jours',
		noNew: '(aucune nouvelle commande)',
		tips: [
			'💡 Tapez .menu <catégorie> pour accéder à une section.',
			'💡 🆕 indique une commande récente.',
			'💡 🔥 indique une commande populaire.',
			'💡 🔒 indique une limite d’utilisation.',
			'💡 💎 indique une commande premium.',
			'💡 Tapez .menu new pour voir les nouveautés.',
			'💡 Tapez .lang ar|fr|en pour changer la langue.',
		],
	},
}

function t(lang, key) {
	const dict = translations[lang] || translations.en
	return dict[key] !== undefined ? dict[key] : translations.en[key]
}

// ==================== MENU ====================

const handler = async (m, { conn, usedPrefix: _p, command, isOwner, args }) => {

	// أسماء الأقسام
	const allTags = {
		main: {
			title: '𓆩『 الرئيسية 』𓆪',
			emoji: '🏠'
		},

		ai: {
			title: '𓆩『 الذكاء الاصطناعي 』𓆪',
			emoji: '🤖'
		},

		downloader: {
			title: '𓆩『 التحميل 』𓆪',
			emoji: '📥'
		},

		uploader: {
			title: '𓆩『 الرفع 』𓆪',
			emoji: '📤'
		},

		editor: {
			title: '𓆩『 التعديل 』𓆪',
			emoji: '🎨'
		},

		sticker: {
			title: '𓆩『 الملصقات 』𓆪',
			emoji: '🎟️'
		},

		tools: {
			title: '𓆩『 الأدوات 』𓆪',
			emoji: '🛠️'
		},

		infobot: {
			title: '𓆩『 معلومات البوت 』𓆪',
			emoji: 'ℹ️'
		},

		games: {
			title: '𓆩『 الألعاب 』𓆪',
			emoji: '🎮'
		},

		group: {
			title: '𓆩『 المجموعات 』𓆪',
			emoji: '👥'
		},

		owner: {
			title: '𓆩『 المطور 』𓆪',
			emoji: '👑'
		},
	}

	let teks = (args[0] || '').toLowerCase()

	const showNewOnly = teks === 'new'

	let invalidCategory =
		teks &&
		!showNewOnly &&
		!Object.keys(allTags).includes(teks)

	let tags = {}

	if (
		showNewOnly ||
		!Object.keys(allTags).includes(teks)
	) {
		teks = 'all'
	}

	tags = teks === 'all'
		? { ...allTags }
		: { [teks]: allTags[teks] }

	// حذف قسم المطور لغير المالك
	if (!isOwner) delete tags.owner

	// حذف قسم المجموعات إذا كانت المحادثة خاصة
	if (!m.isGroup) delete tags.group

	try {

		await m.react('⏳')

		const now = Date.now()

		global.db.data.users[m.sender] =
			global.db.data.users[m.sender] || {}

		let user = global.db.data.users[m.sender]

		// العربية هي اللغة الافتراضية
		const lang = ['ar', 'fr', 'en'].includes(user.lang)
			? user.lang
			: 'ar'

		// ==================== التاريخ والوقت ====================

		let d = new Date()

		let locale =
			lang === 'ar'
				? 'ar-MA'
				: lang === 'fr'
					? 'fr-FR'
					: 'en-US'

		let week = d.toLocaleDateString(locale, {
			weekday: 'long'
		})

		let date = d.toLocaleDateString(locale, {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})

		let time = d.toLocaleTimeString(locale, {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		})

		// ==================== تصميم القائمة ====================

		const defaultMenu = {

			before: `
╭━━━〔 🎩 𝐊𝐀𝐈𝐓𝐎 𝐊𝐈𝐃 〕━━━╮
┃
┃ 🪀 هلا كيفك ➫︙『 @${m.sender.split('@')[0]} 』
┃ 🕐 الوقت الحين ➫︙『 ${time} 』
┃ 📅︙『 ${date} 』
┃
┃ 👨‍💻 المطور ➫︙『 𓆩🇲🇷 𝐌𝐄𝐃 𝐓𝐀𝐑 𝐂𝐑𝟕 🇲🇷𓆪 』
┃ 📞 رقم المطور ➫︙『 +22242203253 』
┃
╰━━━〔  𝐊𝐀𝐈𝐓𝐎 𝐊𝐈𝐃 🎩 〕━━━╯

╭━━━〔 ✦ 𝐈𝐍𝐅𝐎 ✦ 〕━━━╮
┃ ⚡︙البادئة ⟿ %prefix
┃ 📦︙الأوامر ⟿ %totalcmd
┃ 🟢︙الحالة ⟿ %status
╰━━━━━━━━━━━━━━━━━━╯

%tip
%readmore`.trim(),

			newBefore: `
╭━━━〔 🆕 『 الجديد 』 〕━━━╮
┃ ✦ الأوامر المضافة مؤخراً
╰━━━━━━━━━━━━━━━━━━╯
%readmore`.trim(),

			header:
				'\\n╭━━━〔 %emoji %category 〕━━━╮\\n┃',

			body:
				'┃ 𓆩➥𓆪 %index. %cmd%flags',

			footer:
				'╰━━━━━━━━━━━━━━━━━━╯',

			after:
				`\\n╭───────────────╮
│ ✦ ${t(lang, 'tapMenu')}
╰───────────────╯`,
		}

		// ==================== الإحصائيات ====================

		global.db.data.stats =
			global.db.data.stats || {}

		global.db.data.stats.pluginFirstSeen =
			global.db.data.stats.pluginFirstSeen || {}

		const firstSeenMap =
			global.db.data.stats.pluginFirstSeen

		const isFirstBoot =
			Object.keys(firstSeenMap).length === 0

		// ==================== استخراج الأوامر ====================

		const help = Object.entries(global.plugins)

			.filter(([_, p]) => !p.disabled)

			.map(([filename, p]) => {

				if (!(filename in firstSeenMap)) {

					firstSeenMap[filename] =
						isFirstBoot
							? now - (NEW_DAYS + 1) * 86400000
							: now
				}

				const isNewBool =
					now - firstSeenMap[filename] <
					NEW_DAYS * 86400000

				return {

					help:
						Array.isArray(p.help)
							? p.help
							: [p.help],

					tags:
						Array.isArray(p.tags)
							? p.tags
							: [p.tags],

					prefix:
						'customPrefix' in p,

					limit:
						p.limit
							? '🔒'
							: '',

					premium:
						p.premium
							? '💎'
							: '',

					owner:
						p.owner
							? '🄾'
							: '',

					isNew:
						isNewBool
							? '🆕'
							: '',

					isNewBool,

					popular:
						p.popular
							? '🔥'
							: '',
				}
			})

		const totalcmd =
			help.reduce(
				(a, p) => a + p.help.length,
				0
			)

		const totalplugins =
			help.length

		const totalNew =
			help
				.filter(p => p.isNewBool)
				.reduce(
					(a, p) => a + p.help.length,
					0
				)

		const countsByTag =
			Object.keys(allTags).map(tag =>
				help
					.filter(p => p.tags.includes(tag))
					.reduce(
						(a, p) => a + p.help.length,
						0
					)
			)

		const maxCount =
			Math.max(...countsByTag, 1)

		// ==================== قائمة الأقسام ====================

		const rows = [

			...Object.keys(allTags).map(tag => {

				const count =
					help
						.filter(p => p.tags.includes(tag))
						.reduce(
							(a, p) => a + p.help.length,
							0
						)

				return {

					title:
						`${allTags[tag].emoji} ${allTags[tag].title}`,

					description:
						`✦ ${count} ${count === 1 ? 'أمر' : 'أوامر'}`,

					id:
						`${_p + command} ${tag}`,
				}
			}),

			{
				title:
					'🆕 『 الجديد 』',

				description:
					`✦ ${totalNew} ${totalNew === 1 ? 'أمر جديد' : 'أوامر جديدة'}`,

				id:
					`${_p + command} new`,
			},
		]

		let text

		// ==================== قسم الجديد ====================

		if (showNewOnly) {

			const sections =
				Object.keys(allTags).map(tag => {

					const filtered =
						help.filter(
							p => p.tags.includes(tag)
						)

					const list = []

					for (const p of filtered) {

						for (const h of p.help) {

							if (!p.isNewBool)
								continue

							const cmd =
								p.prefix
									? h
									: `${_p}${h}`

							list.push(cmd)
						}
					}

					list.sort(
						(a, b) =>
							a.localeCompare(b)
					)

					if (!list.length)
						return ''

					const items =
						list.map((cmd, i) =>
							defaultMenu.body
								.replace(
									/%index/g,
									String(i + 1)
										.padStart(2, '0')
								)
								.replace(
									/%cmd/g,
									cmd
								)
								.replace(
									/%flags/g,
									' 🆕'
								)
						)

					return `${defaultMenu.header
						.replace(
							'%emoji',
							allTags[tag].emoji
						)
						.replace(
							'%color',
							categoryColors[tag] || '⚪'
						)
						.replace(
							'%category',
							toBoldUnicode(
								allTags[tag].title
							)
						)
						.replace(
							'%count',
							list.length
						)
						.replace(
							'%bar',
							''
						)}
${items.join('\n')}
${defaultMenu.footer}`
				})
				.filter(Boolean)

			text = [
				defaultMenu.newBefore,

				...(
					sections.length
						? sections
						: [`\n${t(lang, 'noNew')}`]
				),

			].join('\n')

		} else {

			// ==================== القائمة الرئيسية ====================

			text = [

				defaultMenu.before,

				...Object.keys(tags).map(tag => {

					const filtered =
						help.filter(
							p => p.tags.includes(tag)
						)

					const list = []

					for (const p of filtered) {

						for (const h of p.help) {

							const cmd =
								p.prefix
									? h
									: `${_p}${h}`

							const flags =
								[
									p.isNew,
									p.popular,
									p.owner,
									p.premium,
									p.limit
								]
									.filter(Boolean)
									.join(' ')

							list.push({
								cmd,
								flags:
									flags
										? ` ${flags}`
										: ''
							})
						}
					}

					list.sort(
						(a, b) =>
							a.cmd.localeCompare(b.cmd)
					)

					const items =
						list.map((entry, i) =>
							defaultMenu.body

								.replace(
									/%index/g,
									String(i + 1)
										.padStart(2, '0')
								)

								.replace(
									/%cmd/g,
									entry.cmd
								)

								.replace(
									/%flags/g,
									entry.flags
								)
						)

					const count =
						list.length

					const filled =
						Math.max(
							1,
							Math.round(
								(count / maxCount) * 10
							)
						)

					const bar =
						'▰'.repeat(filled) +
						'▱'.repeat(10 - filled)

					return `${defaultMenu.header
						.replace(
							'%emoji',
							tags[tag].emoji
						)
						.replace(
							'%color',
							categoryColors[tag] || '⚪'
						)
						.replace(
							'%category',
							toBoldUnicode(
								tags[tag].title
							)
						)
						.replace(
							'%count',
							count
						)
						.replace(
							'%bar',
							bar
						)}
${items.join('\n') || `┃ ${t(lang, 'empty')}`}
${defaultMenu.footer}`
				}),

				invalidCategory
					? `\n⚠️ ${t(lang, 'notFound')}`
					: '',

				defaultMenu.after,

			]
				.filter(Boolean)
				.join('\n')
		}

		// ==================== معلومات المستخدم ====================

		let { registered } = user

		let name =
			registered
				? user.name
				: conn.getName(m.sender)

		let uptime =
			clockString(
				process.uptime() * 1000
			)

		let ram =
			ramUsage()

		let status =
			await checkStatus()

		let totalreg =
			Object.keys(
				global.db.data.users
			).length

		let rtotalreg =
			Object.values(
				global.db.data.users
			)
				.filter(u => u.registered)
				.length

		global.db.data.stats.menuViews =
			(global.db.data.stats.menuViews || 0) + 1

		let views =
			global.db.data.stats.menuViews

		const dayOfYear =
			Math.floor(
				(d - new Date(d.getFullYear(), 0, 0))
				/ 86400000
			)

		const tipList =
			t(lang, 'tips')

		const tip =
			tipList[
				dayOfYear % tipList.length
			]

		// ==================== المتغيرات ====================

		const replace = {

			'%': '',

			p: _p,

			prefix: _p,

			uptime,

			uptimeFormatted: uptime,

			time,

			me:
				conn.user.name,

			name,

			week,

			date,

			totalreg,

			rtotalreg,

			totalcmd,

			totalplugins,

			ram,

			status,

			version:
				global.version || '1.0.0',

			tip,

			views,

			readmore:
				readMore,
		}

		// ==================== إرسال القائمة ====================

		await conn.sendButton(

			m.chat,

			{

				image: {
					url:
						'https://img.pixelvault.dev/playground/tmp_leafngip7en5.png'
				},

				caption:
					text.replace(

						new RegExp(
							`%(${Object.keys(replace).join('|')})`,
							'g'
						),

						(_, key) =>
							replace[key]
					),

				footer:
					`𓆩🎩 𝐊𝐀𝐈𝐓𝐎 𝐊𝐈𝐃 🎩𓆪 • ${time}`,

				buttons: [

					// قائمة الأقسام
					{
						name:
							'single_select',

						buttonParamsJson:
							JSON.stringify({

								title:
									'✦ 『 أقسام البوت 』 ✦',

								sections: [

									{
										title:
											'🎩 𝐊𝐀𝐈𝐓𝐎 𝐊𝐈𝐃',

										rows,
									},

								],
							}),
					},

					// الجديد
					{
						name:
							'quick_reply',

						buttonParamsJson:
							JSON.stringify({

								display_text:
									'🆕 『 الجديد 』',

								id:
									_p +
									command +
									' new',
							}),
					},

					// المطور
					{
						name:
							'quick_reply',

						buttonParamsJson:
							JSON.stringify({

								display_text:
									'👑 『 المطور 』',

								id:
									_p +
									'owner',
							}),
					},
				],
			},

			{
				quoted: m
			}
		)

		await m.react('✅')

	} catch (e) {

		console.error(e)

		await m.react('❌')

		m.reply(
			'حدث خطأ أثناء عرض القائمة.'
		)
	}
}

// ==================== معلومات الأمر ====================

handler.help = ['menu', 'اوامر']

handler.tags = ['main']

handler.command =
	/^(menu|help|اوامر|\?)$/i

export default handler

// ==================== Read More ====================

const more =
	String.fromCharCode(8206)

const readMore =
	more.repeat(4001)

// ==================== Uptime ====================

function clockString(ms) {

	let d =
		Math.floor(
			ms / 86400000
		)

	let h =
		Math.floor(
			ms / 3600000
		) % 24

	let m =
		Math.floor(
			ms / 60000
		) % 60

	let s =
		Math.floor(
			ms / 1000
		) % 60

	let parts =
		[h, m, s]
			.map(v =>
				v
					.toString()
					.padStart(2, '0')
			)
			.join(':')

	return d > 0
		? `${d}d ${parts}`
		: parts
}

// ==================== RAM ====================

function ramUsage() {

	const used =
		process.memoryUsage().rss

	const total =
		os.totalmem()

	return `${(
		used /
		1024 /
		1024
	).toFixed(0)}MB / ${(
		total /
		1024 /
		1024 /
		1024
	).toFixed(1)}GB`
}

// ==================== التحية ====================

function ucapan() {

	const time =
		moment
			.tz('Africa/Nouakchott')
			.format('HH')

	if (time < 4)
		return 'تصبح على خير'

	if (time < 10)
		return 'صباح الخير'

	if (time < 15)
		return 'مساء الخير'

	if (time < 18)
		return 'مساء الخير'

	return 'تصبح على خير'
}

// ==================== حالة البوت ====================

async function checkStatus() {

	global.db.data.stats =
		global.db.data.stats || {}

	const cache =
		global.db.data.stats.statusCache

	if (
		cache &&
		Date.now() - cache.checkedAt <
		STATUS_CACHE_MS
	) {
		return cache.result
	}

	const services = [

		{
			name: 'WhatsApp',

			check:
				async () => true,
		},

		{
			name: 'Database',

			check:
				async () =>
					!!(
						global.db &&
						global.db.data
					),
		},
	]

	const results = {}

	for (const s of services) {

		try {

			results[s.name] =
				(
					await s.check()
				)
					? '🟢'
					: '🔴'

		} catch {

			results[s.name] =
				'🔴'
		}
	}

	const resultText =
		Object.entries(results)
			.map(
				([k, v]) =>
					`${v} ${k}`
			)
			.join(' | ')

	global.db.data.stats.statusCache = {

		checkedAt:
			Date.now(),

		result:
			resultText,
	}

	return resultText
}