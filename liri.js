//Load dotenv package and secret keys and ids 
require("dotenv").config();
var keys = require("./keys.js");

//Load remaining required packages
var axios = require('axios');
var inquirer = require('inquirer');
var colors = require('colors');
var fs = require('fs');
var moment = require('moment');

// initialize global variables
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var argvArr = process.argv;
var searchType = argvArr[2];
var searchTerm = argvArr.slice(3).join(" ");

function bandsInTown(artist){
    axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id="+keys.bandsInTown.id)
    .then(function (response) {
        //console.log(response); 
        console.log(colors.yellow('---------- Startof Bands In Town Concerts -----------'));
        console.log('Artist name: \t'+colors.magenta(response.data[0].lineup[0])); 
        console.log('Venue name:\t'+colors.magenta(response.data[0].venue.name));
        console.log('Venue name:\t'+colors.magenta(response.data[0].venue.city+', '+response.data[0].venue.region+', '+response.data[0].venue.country));
        var concertDate = response.data[0].datetime;
        var dateFormat = "MM/DD/YYYY";
        var convertedDate = moment(concertDate, dateFormat);
        console.log('Concert Date:\t'+colors.magenta(concertDate));
        console.log('Concert Date:\t'+convertedDate);
        console.log(colors.yellow('---------- Endof Bands In Town Concerts -----------'));
        

        //console.log('Name of the venue:\t' );
        //console.log('Venue location:\t' );
        //console.log('Date of event:\t' );
         //use moment to format this as "MM/DD/YYYY")
    })
    .catch(function (error) {
        console.log(error);
    });

};

function spotifySong(song){
//     * Artist(s)
//     * The song's name
//     * A preview link of the song from Spotify
//     * The album that the song is from
//   * If no song is provided then your program will default to "The Sign" by Ace of Base.

    if(song === '' || song === undefined){
        song = 'I saw the sign';
    }

    spotify.search({ type: 'track', query: song }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
      console.log(colors.yellow('---------- Startof Spotify Track Info -----------'));
      console.log(colors.blue('Artist:\t\t'+data.tracks.items[0].artists[0].name));
      console.log(colors.blue('Song name:\t'+data.tracks.items[0].name));
      console.log(colors.blue('Album URL:\t'+data.tracks.items[0].external_urls.spotify));
      console.log(colors.yellow('---------- Endof Spotify Track Info -----------'));
    });
}

function omdb(movie){

    // * Title of the movie.
    // * Year the movie came out.
    // * IMDB Rating of the movie.
    // * Rotten Tomatoes Rating of the movie.
    // * Country where the movie was produced.
    // * Language of the movie.
    // * Plot of the movie.
    // * Actors in the movie.
    if(movie === '' || movie === undefined){
        movie = 'Mr. Nobody';
    }
    
    var queryURL = "https://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey="+keys.omdb.key;

    axios.get(queryURL)
    .then(function(response) {
        
        //console.log(response.data);
        var dataString = '';
        var movieData = [
            "Title: " + response.data.Title,
            "Year: " + response.data.Year,
            'Ratings: IMDB: '+response.data.Ratings[0].Value+'\tRotten Tomatoes: '+response.data.Ratings[1].Value,
            'Country (produced in):\t'+response.data.Country,
            'Language:'+response.data.Language,
            'Plot:\t'+response.data.Plot,
            'Actors:\t'+response.data.Actors
          ].join("\n\n");

        console.log(colors.yellow('---------- Startof OMDB Moive Info -----------'));
        console.log(colors.bold('Title:\t')+colors.underline.green(response.data.Title)+'\t\tYear: '+colors.italic.green(response.data.Year));
        console.log(colors.bold('Ratings: ')+colors.green('IMDB: ')+colors.green(response.data.Ratings[0].Value)+colors.green('\tRotten Tomatoes: ')+colors.green(response.data.Ratings[1].Value));
        console.log(colors.bold('Country (produced in):\t')+colors.italic.green(response.data.Country));
        console.log(colors.bold('Language:')+colors.italic.green(response.data.Language));
        console.log(colors.bold('Plot:\t')+colors.italic.green(response.data.Plot));
        console.log(colors.bold('Actors:\t')+colors.italic.green(response.data.Actors));
        console.log(colors.yellow('---------- Endof OMDB Moive Info -----------'));

        logToFile(movieData);
    })
    .catch(function (error) {
        console.log(error);
    });

    
};

function readRandomFile(){
        var data = fs.readFileSync('random.txt',"utf8");
        var contentsArr = data.split(",");
        searchType = contentsArr[0];
        searchTerm = contentsArr.slice(1).join(" ");
        commandByArgv();
};

function commandByArgv(){
    switch(searchType){
        case `concert-this`:
            bandsInTown(searchTerm);
            break;
        case `spotify-this-song`:
            spotifySong(searchTerm);
            break;
        case  `movie-this`:
            omdb(searchTerm);
             break;
        case `do-what-it-says`:
            readRandomFile();
            break;
        default :
            console.log(colors.red('Error. You entered an invalid command.'));
            console.log(colors.blue('\nUse on of the following:'));
            console.log(colors.blue('\nconcert-this <band name>'));
            console.log(colors.blue('\nspotify-this-song <song name>'));
            console.log(colors.blue('\nmovie-this <movie title>'));
            console.log(colors.blue('\ndo-what-it-says\n'));
    }
};

function logToFile(string){
    // divider will be used as a spacer between the tv data we print in log.txt
     var divider = "\n------------------------------------------------------------\n\n";

     // Append showData and the divider to log.txt, print showData to the console
     fs.appendFile("log.txt", string + divider, function(err) {
        if (err) throw err;
        console.log('Appended to File!');
      });
}



commandByArgv();