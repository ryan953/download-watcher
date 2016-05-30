'use strict';

const config = require('./config');

const TV_SEASON_EPISODE = '\\WS([0-9]{1,3})E[0-9]{1,3}\\W';

const TV_SEASON_EPISODE_REGEXP = new RegExp(TV_SEASON_EPISODE, 'i');
const TV_TITLE_REGEXP = new RegExp('(.*)?' + TV_SEASON_EPISODE, 'i');

function isMovie(file) {
  return false;
}

function isTV(file) {
  return TV_SEASON_EPISODE_REGEXP.test(file);
}

function tvName(file) {
  const result = TV_TITLE_REGEXP.exec(file);
  if (!result) {
    return '';
  }

  return result[1].replace(/\W/g, ' '); // first match group
}

function tvSeason(file) {
  const result = TV_SEASON_EPISODE_REGEXP.exec(file);
  if (!result) {
    return '';
  }

  return parseInt(result[1], 10); // first match group
}

function tvFolder(file) {
  if (!isTV(file)) {
    return null;
  }
  const name = tvName(file);
  const season = tvSeason(file);

  return `${config.dest_tv}/${name}/Season - ${season}`;
}

function movieFolder(file) {
  if (isTV(file)) {
    return null;
  }
  return config.dest_movie;
}

module.exports = {

  type: function(file) {
    return {
      isMovie: isMovie(file),
      isTV: isTV(file),
      tvName: tvName(file),
      tvSeason: tvSeason(file),
      tvFolder: tvFolder(file),
      movieFolder: movieFolder(file),
      destFolder: isTV(file)
        ? tvFolder(file)
        : movieFolder(file),
    };
  },

};
