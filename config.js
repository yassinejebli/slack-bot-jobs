module.exports = {
  port: process.env.PORT,
  slignSigningSecret: process.env.SLACK_SIGNING_SECRET,
  slackBotToken: process.env.SLACK_BOT_TOKEN,
  slackUserToken: process.env.SLACK_USER_TOKEN,
  generalChannelId: process.env.GENERAL_CHANNEL_ID,
};
