console.log('Environment Variables Loaded');

exports.spotify = {
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
};

exports.bandsInTown = {
    id: process.env.BANDS_IN_TOWN
}

exports.omdb = {
    key: process.env.OMDB
}