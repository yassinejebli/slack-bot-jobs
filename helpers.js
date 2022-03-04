const cheerio = require("cheerio");

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

module.exports = {
  parseJobs,
};
