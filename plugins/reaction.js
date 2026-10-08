/*
 * WhatsApp Reaction
 * Author: skrep: xvlovers
 * GitHub: https://github.com/xvlovers/kumpulan-scrape-dan-plugin-esm-cjs-/blob/main/reactionWa.js
 * Base URL: https://reaction-whatsapp.edgeone.dev
 * Credit: reaction whatsapp
 */

import axios from 'axios'

const BASE_URL = 'https://reaction-whatsapp.edgeone.dev'
const API_KEY = 'C3CENFUP'

const handler = async (m, { conn, args }) => {
  // Guide
  if (!args[0] || args[0].toLowerCase() === 'help') {
    return m.reply(
      `*WhatsApp Reaction Guide*\n\n` +
      `This feature allows you to add an emoji reaction to a WhatsApp message using its message link.\n\n` +
      `*How to use:*\n` +
      `.reaction <message-link> <emoji>\n\n` +
      `*Example:*\n` +
      `.reaction https://whatsapp.com/channel/xxxxx/1234 ❤️\n\n` +
      `*Arguments:*\n` +
      `• Message link — The WhatsApp message you want to react to.\n` +
      `• Emoji — The emoji you want to use as the reaction.\n\n` +
      `*Tip:* Make sure the message link is valid and accessible to the reaction service.`
    )
  }

  const link = args[0]
  const emoji = args.slice(1).join(' ')

  if (!link || !emoji) {
    return m.reply(
      `❌ Invalid usage.\n\n` +
      `Use:\n` +
      `.reaction <message-link> <emoji>\n\n` +
      `Example:\n` +
      `.reaction https://whatsapp.com/channel/xxxxx/1234 ❤️\n\n` +
      `Use *.reaction help* for more information.`
    )
  }

  try {
    await m.reply('⏳ Processing your reaction...')

    const res = await axios.post(
      `${BASE_URL}/react`,
      {
        link,
        emoji
      },
      {
        timeout: 60000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
          Origin: BASE_URL,
          Referer: `${BASE_URL}/`
        },
        validateStatus: () => true
      }
    )

    if (res.status === 200) {
      return m.reply(
        `✅ *Reaction sent successfully!*\n\n` +
        `Emoji: ${emoji}\n` +
        `Status: ${res.status}`
      )
    }

    return m.reply(
      `❌ *Failed to send reaction.*\n\n` +
      `HTTP Status: ${res.status}\n` +
      `Response: ${JSON.stringify(res.data)}`
    )
  } catch (error) {
    console.error('Reaction WhatsApp Error:', error)

    return m.reply(
      `❌ *An error occurred while processing the reaction.*\n\n` +
      `${error.message}`
    )
  }
}

handler.help = handler.command = ['reaction']
handler.tags = ['tools']
handler.limit = true

export default handler
