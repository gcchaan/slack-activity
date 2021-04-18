// eslint-disable-next-line import/no-unresolved
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as crypto from 'crypto'

export function isInvalidSignature(event: APIGatewayProxyEvent): boolean {
  let slackSigningSecret: string
  if (process.env.SLACK_SIGNING_SECRET) {
    slackSigningSecret = process.env.SLACK_SIGNING_SECRET
  } else {
    throw Error('unset environment variable.')
  }
  const timestamp = event.headers['X-Slack-Request-Timestamp'] as string
  const actualSignature = event.headers['X-Slack-Signature'] as string
  const sigBaseString = `v0:${timestamp}:${event['body']}`
  const hmac = crypto.createHmac('sha256', slackSigningSecret)
  const expectedSignature = 'v0=' + hmac.update(sigBaseString).digest('hex')
  if (actualSignature !== expectedSignature) {
    console.log('check signature error.')
    console.log(`${actualSignature} !== ${expectedSignature}`)
  }
  return actualSignature !== expectedSignature
}

export function isInvalidTimestamp(event: APIGatewayProxyEvent): boolean {
  const timestamp = event.headers['X-Slack-Request-Timestamp'] as string
  return Math.abs(parseInt(timestamp, 10) - Math.floor(new Date().getTime() / 1000)) > 60 * 5
}

export const response = {
  ok(body?: string): APIGatewayProxyResult {
    return {
      statusCode: 200,
      body: body || '',
    }
  },
  forbidden(): APIGatewayProxyResult {
    return {
      statusCode: 403,
      body: '',
    }
  },
}
