const axios = require("axios");

// Returns data as html
function fetchOpeningJobs() {
  return axios
    .get("https://boards.greenhouse.io/cobaltio")
    .then((response) => response.data);
}

module.exports = { fetchOpeningJobs };
