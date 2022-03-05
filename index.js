require("dotenv").config();
const cors = require("cors");
const { App, ExpressReceiver } = require("@slack/bolt");
const { GREENHOUSE_BOARDS_URL } = require("./constants");
const config = require("./config");
const api = require("./api");
const helpers = require("./helpers");
const renderHome = require("./renderHome");
const memoryCache = require("./memoryCache");

const expressReceiver = new ExpressReceiver({
  signingSecret: config.slignSigningSecret,
});

const expressApp = expressReceiver.app;

const app = new App({
  signingSecret: config.slignSigningSecret,
  token: config.slackBotToken,
  receiver: expressReceiver,
});

expressApp.use(cors());

expressApp.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "application/x-www-form-urlencoded",
    "Origin, X-Requested-Width, Content-Type, Accept, Authorization"
  );
  next();
});

// TODO: pagination
expressApp.get("/users", async (req, res) => {
  const users = await getUserList();
  res.status(201).json(users);
  res.end();
});

expressApp.delete("/users/:id", async (req, res) => {
  try {
    const teamId = (await app.client.team.info()).team.id;
    await deleteUser(req.params.id, teamId);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  } finally {
    res.end();
  }
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
  // return
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
            await app.client.chat.postMessage({
              channel: config.generalChannelId,
              text:
                "New job posted: <" +
                GREENHOUSE_BOARDS_URL +
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

// Better to fetch/save users data in a DB.
async function getUserList() {
  try {
    const result = await app.client.users.list();
    return result.members;
  } catch (error) {
    console.error(error);
  }
}

// administrative permissions needed for app.client.admin.users.remove method but Apps with this feature are only available to Enterprise customers (scope: admin.users:write)
async function deleteUser(userId, teamId) {
  return app.client.admin.users.remove({
    team_id: teamId,
    user_id: userId,
    token: config.slackUserToken,
  });
}
