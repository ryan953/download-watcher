const SEASON_EPISODE = /S[0-9]{1,3}E[0-9]{1-3}/;


function isMovie(file) {
  return false;
}

function isTV(file) {
  return false;
}

function tvName(file) {
  return '';
}

module.exports = {

  type: function(file) {
    return {
      isMovie: isMovie(file),
      isTV: isTV(file),
      tvName: tvName(file),
    };
  },

};
