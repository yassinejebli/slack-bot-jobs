require("dotenv").config();
const { App } = require("@slack/bolt");
const api = require("./api");
const helpers = require("./helpers");
const renderHome = require("./renderHome");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_USER_TOKEN,
});

app.event("app_home_opened", async ({ event, client }) => {
  try {
    const openingJobsHTML = await api.fetchOpeningJobs();
    const openingJobs = helpers.parseJobs(openingJobsHTML);
    await client.views.publish(renderHome({ user: event.user, openingJobs }));
  } catch (error) {
    console.error(error);
  }
});

app.start(process.env.PORT || 3000).then(() => {
  console.log("App is running");
});
