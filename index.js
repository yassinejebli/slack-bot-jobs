require("dotenv").config();
const { App } = require("@slack/bolt");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_USER_TOKEN,
});

app.start(process.env.PORT || 8080).then(() => console.log("App is running"));
