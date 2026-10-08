import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        throw `ضع رابط GitHub لتحميل المستودع كاملًا.\n\nمثال:\n${usedPrefix + command} https://github.com/user/repo`;
    }

    try {
        let input = text.trim();

        // استخراج اسم المستخدم والمستودع
        const match = input.match(
            /^(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/#?]+)(?:[\/#?].*)?$/i
        );

        if (!match) {
            throw '❌ رابط GitHub غير صالح.';
        }

        const user = match[1];
        const repo = match[2].replace(/\.git$/i, '');

        await m.reply('📦 جاري تجهيز المستودع كاملًا...\n\n⏳ انتظر قليلًا...');

        // الحصول على الفرع الافتراضي
        const apiUrl = `https://api.github.com/repos/${user}/${repo}`;

        const info = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 30000
        });

        const branch = info.data.default_branch || 'main';

        // رابط تحميل المستودع كاملًا
        const zipUrl =
            `https://codeload.github.com/${user}/${repo}/zip/refs/heads/${encodeURIComponent(branch)}`;

        // التأكد أن الرابط يعمل
        const check = await axios.head(zipUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 30000,
            maxRedirects: 5
        });

        if (check.status < 200 || check.status >= 400) {
            throw `فشل الوصول إلى المستودع. HTTP ${check.status}`;
        }

        await conn.sendMessage(
            m.chat,
            {
                document: {
                    url: zipUrl
                },
                fileName: `${repo}.zip`,
                mimetype: 'application/zip',
                caption:
                    `📦 *تم تجهيز المستودع كاملًا*\n\n` +
                    `👤 المالك: ${user}\n` +
                    `📁 المستودع: ${repo}\n` +
                    `🌿 الفرع: ${branch}`
            },
            { quoted: m }
        );

    } catch (error) {
        console.error('GITHUB ERROR:', error);

        let msg = error?.response?.data?.message ||
                  error?.message ||
                  String(error);

        await m.reply(`❌ فشل تحميل المستودع.\n\n${msg}`);
    }
};

handler.help = ['git'];
handler.tags = ['downloader'];
handler.command = /^(جيت)$/i;
handler.limit = true;

export default handler;