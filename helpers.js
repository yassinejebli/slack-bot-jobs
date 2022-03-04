const cheerio = require("cheerio");
const memoryCache = require("./memoryCache");
const api = require("./api");

// TODO: jsdoc
function parseJobs(html) {
  const jobs = [];
  const $ = cheerio.load(html);
  const links = $(".opening a");
  links.each(function () {
    const link = $(this).attr("href");
    const title = $(this).text();
    const id = link.split("/").slice(-1)[0];
    jobs.push({ id, title, link });
  });

  return jobs;
}

async function getNewOpeningJobs() {
  const openingJobsHTML = await api.fetchOpeningJobs();
  const newOpeningJobs = parseJobs(openingJobsHTML);
  const oldOpeningJobs = memoryCache.get("opening-jobs") || [];
  const oldpeningJobIds = oldOpeningJobs.map(
    (oldOpeningJob) => oldOpeningJob.id
  );
  memoryCache.set("opening-jobs", newOpeningJobs);
  return newOpeningJobs.filter(
    (newOpeningJob) => !oldpeningJobIds.includes(newOpeningJob.id)
  );
}

function delay(seconds) {
  return new Promise((res) => setTimeout(res, seconds * 1000));
}

module.exports = {
  parseJobs,
  getNewOpeningJobs,
  delay,
};
