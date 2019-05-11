//Load dotenv package and secret keys and ids 
require("dotenv").config();
var keys = require("./keys.js");

//Load remaining required packages
var axios = require('axios');
var inquirer = require('inquirer');
var colors = require('colors');
var fs = require('fs');

// initialize global variables
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var argvArr = process.argv;

function bandsInTown(artist){
    axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp")
    .then(function (response) {
        console.log(JSON.stringify(response.agent, null, 2)); 
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
    
    if(song === '' || song === undefined){
        song = 'I saw the sign';
    }
    spotify.search({ type: 'track', query: song }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
      console.log(JSON.stringify(data, null, 2)); 
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
    
    var queryURL = "https://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";

    axios.get(queryURL)
    .then(function(response) {
        
        console.log(response.data);
        var dataString = '';
        var movieData = [
            "Title: " + response.data.Title,
            "Year: " + response.data.Year,
            colors.bold('Ratings: ')+colors.green('IMDB: ')+colors.green(response.data.Ratings[0].Value)+colors.green('\tRotten Tomatoes: ')+colors.green(response.data.Ratings[1].Value)
          ].join("\n\n");
        console.log(colors.yellow('---------- Startof OMDB Moive Info -----------'));
        console.log(colors.bold('Title:\t')+colors.underline.green(response.data.Title)+'\t\tYear: '+colors.italic.green(response.data.Year));
        console.log(colors.bold('Ratings: ')+colors.green('IMDB: ')+colors.green(response.data.Ratings[0].Value)+colors.green('\tRotten Tomatoes: ')+colors.green(response.data.Ratings[1].Value));
        console.log(colors.bold('Country (produced in):\t')+colors.italic.green(response.data.Country));
        console.log(colors.bold('Language:')+colors.italic.green(response.data.Language));
        console.log(colors.bold('Plot:\t')+colors.italic.green(response.data.Plot));
        console.log(colors.bold('Actors:\t')+colors.italic.green(response.data.Actors));
        colors.yellow('---------- Endof OMDB Moive Info -----------');

        logToFile(movieData);
    })
    .catch(function (error) {
        console.log(error);
    });

    
};

function readRandomFile(){

};

function commandByArgv(){
    switch(argvArr[2]){
        case `concert-this`:
            bandsInTown(argvArr.slice(3).join(" "));
            break;
        case `spotify-this-song`:
            spotifySong(argvArr.slice(3).join(" "));
            break;
        case  `movie-this`:
            omdb(argvArr.slice(3).join(" "));
             break;
        case `do-what-it-says`:
            readRandomFile();
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