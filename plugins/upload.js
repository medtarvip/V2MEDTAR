import axios from 'axios';
import FormData from 'form-data';

async function uploadImage(imageBuffer) {
    try {
        const form = new FormData();

        form.append('file', imageBuffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });

        const response = await axios.post(
            'https://cdn.zavedya.id/upload',
            form,
            {
                method: 'POST',
                headers: {
                    ...form.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        return response.data.url;

    } catch (error) {
        throw new Error(
            `Upload failed: ${
                error.response?.data
                    ? JSON.stringify(error.response.data)
                    : error.message
            }`
        );
    }
}

const handler = async (m, { conn }) => {
    try {
        await m.react('⌛');

        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';

        if (!mime.startsWith('image')) {
            throw new Error(
                'Please reply to an image or send an image with the command as the caption.'
            );
        }

        const media = await q.download();
        const imageUrl = await uploadImage(media);

        await m.react('✅');

        await conn.sendMessage(
            m.chat,
            {
                text: imageUrl
            },
            {
                quoted: m
            }
        );

    } catch (error) {
        await m.react('❌');

        await conn.sendMessage(
            m.chat,
            {
                text: `❌ *Error:* ${error.message}`
            },
            {
                quoted: m
            }
        );
    }
};

handler.help = ['upload'];
handler.tags = ['uploader'];
handler.command = ['upload'];
handler.limit = false;

export default handler;
