const core = require('@actions/core');
const { context } = require('@actions/github');
const { WebClient } = require('@slack/web-api');

const {
  SLACK_BOT_TOKEN,
  GITHUB_RUN_ID,
} = process.env;

const getInputs = () => {
  return {
    channelId: core.getInput('channel_id'),
    product: core.getInput('product'),
    version: core.getInput('version'),
    environment: core.getInput('environment'),
    envUrl: core.getInput('environment_url'),
    status: core.getInput('status'),
    messageId: core.getInput('message_id'),
  }
}

const buildMessage = () => {

}

(async () => {
  try {
    const {
      channelId,
      product,
      version,
      environment,
      envUrl,
      status,
      color,
      messageId,
    } = getInputs();

    const runId = parseInt(GITHUB_RUN_ID, 10);
    const { owner, repo } = context.repo;

    const slack = new WebClient(SLACK_BOT_TOKEN);

    const method = Boolean(messageId) ? 'update' : 'postMessage';

    const args = {
      channel: channelId,
      icon_url: 'https://github.githubassets.com/favicon.ico',
      username: 'Github Deploy Bot',
      blocks: [
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Product:*\n<https://github.com/${owner}/${repo} | ${product}>`,
            },
            {
              type: 'mrkdwn',
              text: `*Version:*\n<https://github.com/${owner}/${repo}/releases/tag/${version} | ${version}>`,
            },
            {
              type: 'mrkdwn',
              text: `*Environment:*\n${environment}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n${status}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'image',
              image_url: 'https://github.githubassets.com/favicon.ico',
              alt_text: 'github',
            },
            {
              type: 'mrkdwn',
              text: `Triggered from <https://github.com/${owner}/${repo}/actions/runs/${runId} | ${owner}/${repo}>`,
            },
          ],
        },
      ],
      text: `Deploying ${product}@${version} to ${environment}`,
    }

    if (envUrl) {
      args.blocks[0].fields[2].text = `*Environment:*\n<${envUrl} | ${environment}>`;
    }

    if (messageId) {
      args.ts = messageId;
    }

    const response = await slack.chat[method](args);

    core.setOutput('message_id', response.ts);
  } catch (err) {
    core.setFailed(err);
  }
})();
