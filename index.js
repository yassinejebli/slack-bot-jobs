require("dotenv").config();
const { App } = require("@slack/bolt");
const { WebClient } = require("@slack/web-api");
const config = require("./config");
const api = require("./api");
const helpers = require("./helpers");
const renderHome = require("./renderHome");
const memoryCache = require("./memoryCache");

const client = new WebClient(config.slackBotUserToken);

const app = new App({
  signingSecret: config.slignSigningSecret,
  token: config.slackBotUserToken,
});

app.event("app_home_opened", async ({ event, client }) => {
  try {
    const openingJobsHTML = await api.fetchOpeningJobs();
    const openingJobs = helpers.parseJobs(openingJobsHTML);
    // memoize the opening jobs that were seen by the user, will use the cached jobs to compare them with the most recent ones, if they are different then the user should be notified about the new posting(s)
    memoryCache.set("opening-jobs", openingJobs);
    await client.views.publish(renderHome({ user: event.user, openingJobs }));
  } catch (error) {
    console.error(error);
  }
});

app.start(config.port || 3000).then(() => {
  console.log("App is running");
  postJobsToTheGeneralChannelWhenJobsAreUpdated();
});

function postJobsToTheGeneralChannelWhenJobsAreUpdated() {
  setInterval(async () => {
    try {
      const openingJobsDelta = await helpers.getNewOpeningJobs();
      const areOpeningJobsChanged = openingJobsDelta.length > 0;
      if (areOpeningJobsChanged) {
        Promise.all(
          openingJobsDelta.map(async (newOpeningJob) => {
            await client.chat.postMessage({
              channel: config.generalChannelId,
              text:
                "New job posted: <https://boards.greenhouse.io" +
                newOpeningJob.link +
                "|" +
                newOpeningJob.title +
                ">",
            });
            // From docs: chat.postMessage has special rate limiting conditions. It will generally allow an app to post 1 message per second to a specific channel
            await helpers.delay(2); // 2 sec
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  }, 8000);
}
