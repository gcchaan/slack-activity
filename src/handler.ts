import 'source-map-support/register'

import { ChatPostMessageArguments } from '@slack/web-api'
// eslint-disable-next-line import/no-unresolved
import { APIGatewayProxyHandler } from 'aws-lambda'

import { isInvalidSignature, isInvalidTimestamp, response } from './handlerHelper'
import { web } from './slack'
import { EventBody } from './types/slack'

function channelEventText(eventBody: EventBody): string {
  let text: string
  switch (eventBody.event.type) {
    case 'channel_created':
      text = `<#${eventBody.event.channel.id}> is created by \`<@${eventBody.event.channel.creator}>\`.`
      break
    case 'channel_deleted':
      text = `<#${eventBody.event.channel}> is deleted by \`<@${eventBody.event.actor_id}>\`.`
      break
    case 'channel_archive':
      text = `<#${eventBody.event.channel}> is archived by \`<@${eventBody.event.user}>\`.`
      break
    case 'channel_unarchive':
      text = `<#${eventBody.event.channel}> is unarchived by \`<@${eventBody.event.user}>\`.`
      break
    default:
      text = 'unknown event.type is found.'
      break
  }
  return text
}

function channelEmojiText(eventBody: EventBody): string {
  if (eventBody.event.type != 'emoji_changed') return ''
  let emoji,
    text = ''
  switch (eventBody.event.subtype) {
    case 'add':
      if (eventBody.event.value.startsWith('alias')) {
        // alias
        emoji = eventBody.event.name
        text = `emoji alias is added: :${eventBody.event.value.split(':')[1]}: => ${emoji}`
      } else {
        // add
        emoji = eventBody.event.name
        text = `emoji is added: :${emoji}:(\`${emoji}\`)`
      }
      break
    case 'remove':
      emoji = eventBody.event.names.join(', ')
      text = `emoji is removed: \`:${emoji}:\``
      break
    default:
      break
  }
  return text
}

async function postMessage(text: string): Promise<void> {
  if (!process.env.SLACL_CHANNEL) throw Error('process.env.SLACL_CHANNEL is unset.')
  const options: ChatPostMessageArguments = {
    channel: process.env.SLACL_CHANNEL,
    text: text,
  }
  await web.chat.postMessage(options)
}

export const app: APIGatewayProxyHandler = async (event, _context) => {
  console.log(JSON.stringify(event, null, 2))
  if (isInvalidTimestamp(event) || isInvalidSignature(event)) {
    return response.forbidden()
  }
  if (!event.body) return response.forbidden()
  if (event.body.startsWith('{')) {
    const eventBody = JSON.parse(event.body) as EventBody
    if (eventBody.type && eventBody.type == 'event_callback') {
      console.log('event_callback')
      let text = ''
      if (eventBody.event.type == 'emoji_changed') {
        text = channelEmojiText(eventBody)
      } else if (eventBody.event.type) {
        text = channelEventText(eventBody)
      }
      await postMessage(text)
      return response.ok()
    }
    if (eventBody.challenge) {
      console.log('respond challenge')
      return response.ok(event.body)
    }
  }
  return response.ok()
}
