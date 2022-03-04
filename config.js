module.exports = {
  port: process.env.PORT,
  slignSigningSecret: process.env.SLACK_SIGNING_SECRET,
  slackBotUserToken: process.env.SLACK_BOT_USER_TOKEN,
  generalChannelId: process.env.GENERAL_CHANNEL_ID,
};
