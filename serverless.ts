import { AWS } from '@serverless/typescript'

import { settings } from './settings'

const serverlessConfiguration: AWS = {
  service: 'slack-activity',
  frameworkVersion: '2',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    profile: settings.awsProfile,
    region: 'ap-northeast-1',
    runtime: 'nodejs12.x',
    memorySize: 128,
    timeout: 10,
    apiGateway: {
      shouldStartNameWithService: true,
      minimumCompressionSize: 128,
    },
    environment: {
      SLACK_SIGNING_SECRET: settings.slackSigningSecret,
      SLACK_BOT_TOKEN: settings.slackBotToken,
      SLACK_CHANNEL: settings.slackChannel,
    },
    lambdaHashingVersion: '20201221',
  },
  custom: {
    esbuild: {
      watch: {
        pattern: ['src/**/*.ts'],
      },
    },
  },
  functions: {
    app: {
      handler: 'src/handler.app',
      events: [
        {
          http: {
            method: 'post',
            path: 'app',
          },
        },
      ],
    },
  },
}

module.exports = serverlessConfiguration
