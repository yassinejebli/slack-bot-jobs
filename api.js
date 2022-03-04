const axios = require("axios");
const { GREENHOUSE_BOARDS_URL } = require("./constants");

// Returns data as html, unfortunately it is not possible to fetch opening jobs by company using greenhouse api (but I'm not 100% sure)
function fetchOpeningJobs() {
  return axios
    .get(GREENHOUSE_BOARDS_URL + "/cobaltio")
    .then((response) => response.data);
}

module.exports = { fetchOpeningJobs };
