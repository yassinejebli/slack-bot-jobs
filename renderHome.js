module.exports = function ({ user, openingJobs }) {
  let blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Cobalt.io*",
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Cobalt* is a fast-growing startup that is redefining pentesting and making cybersecurity easier and more accessible. Our Pentest as a Service (PtaaS) platform, coupled with an exclusive global community of testers, delivers the real-time insights you need to remediate risk quickly and innovate securely. We have Scandinavian roots, an American base and a global outlook. Our remote-first team is characterized by a fun, fast-paced and collaborative culture based on individual responsibility and ownership.",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Current Job Openings (" + openingJobs.length + ")*",
      },
    },
  ];

  blocks = blocks.concat(
    openingJobs.map((job) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "<https://boards.greenhouse.io" + job.link + "|" + job.title + ">",
      },
    }))
  );
  return {
    user_id: user,
    view: {
      type: "home",
      callback_id: "home_view",
      blocks,
    },
  };
};
