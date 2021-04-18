import { WebClient } from '@slack/web-api'

let token: string
if (process.env.SLACK_BOT_TOKEN) {
  token = process.env.SLACK_BOT_TOKEN
} else {
  throw Error('SLACK_BOT_TOKEN is unset.')
}

export const web = new WebClient(token)
