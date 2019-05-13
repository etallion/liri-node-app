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
        //Format data into string to append to log.txt file
        var dataString = '';
        var concertData = [
            '---------- Startof Bands In Town Concerts -----------',
            "Artist:\t" + response.data[0].lineup[0],
            'Venue name:\t'+response.data[0].venue.name,
            'Venue name:\t'+response.data[0].venue.city+', '+response.data[0].venue.region+', '+response.data[0].venue.country,
            'Concert Date:\t'+concertDate
            ].join("\n\n");
            logToFile(concertData);

        //Format response for console with colors
        console.log(colors.yellow('---------- Startof Bands In Town Concerts -----------'));
        console.log('Artist name: \t'+colors.magenta(response.data[0].lineup[0])); 
        console.log('Venue name:\t'+colors.magenta(response.data[0].venue.name));
        console.log('Venue name:\t'+colors.magenta(response.data[0].venue.city+', '+response.data[0].venue.region+', '+response.data[0].venue.country));
        var concertDate = response.data[0].datetime;
        //var removeTFromDateString = concertDate.split("T").join(" ");
        var removeTFromDateString = concertDate.replace("T", " ");
        var dateFormat = "MM/DD/YYYY";
        var convertedDate = moment(removeTFromDateString).format(dateFormat);
        console.log('Concert Date:\t'+colors.magenta(convertedDate));
       // console.log('Concert Date:\t'+ convertedDate);
        console.log(colors.yellow('---------- Endof Bands In Town Concerts -----------'));
        

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

    //If no song is provided then your program will default to "The Sign" by Ace of Base.
    if(song === '' || song === undefined){
        song = 'I saw the sign';
    }

    spotify.search({ type: 'track', query: song }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        //Format data into string to append to log.txt file
        var dataString = '';
        var songData = [
            "Artist:\t" + data.tracks.items[0].artists[0].name,
            "Song:\t" + data.tracks.items[0].name,
            'Album URL:\t'+data.tracks.items[0].external_urls.spotify,
          ].join("\n\n");
          logToFile(songData);

        //Format for console with colors 
        console.log(colors.yellow('---------- Startof Spotify Track Info -----------'));
        console.log('Artist:\t\t'+colors.cyan(data.tracks.items[0].artists[0].name));
        console.log('Song name:\t'+colors.cyan(data.tracks.items[0].name));
        console.log('Album URL:\t'+colors.cyan(data.tracks.items[0].external_urls.spotify));
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
    if(!movie){
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
            'Language: '+response.data.Language,
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
            console.log(colors.yellow('\nUse one of the following:'));
            console.log(colors.yellow('\nconcert-this <band name>'));
            console.log(colors.yellow('\nspotify-this-song <song name>'));
            console.log(colors.yellow('\nmovie-this <movie title>'));
            console.log(colors.yellow('\ndo-what-it-says\n'));
            commandByInquirer();
    }
};

function logToFile(string){
    // divider will be used as a spacer between the tv data we print in log.txt
     var divider = "\n------------------------------------------------------------\n\n";

     // Append showData and the divider to log.txt, print showData to the console
     fs.appendFile("log.txt", string + divider, function(err) {
        if (err) throw err;
        console.log(colors.gray('*This information has been appended to the log.txt file.'));
      });
}

function commandByInquirer(){
    inquirer.prompt([
        {
            type: "list",
            name: 'type',
            message: 'Search by Bands In Town, Spotify, and OMDB API:',
            choices: ['concert-this', 'spotify-this-song', 'movie-this', 'do-what-it-says']
        },
        {
            type: 'input',
            name: 'term',
            message: 'Great! Which one are you searching for?'
        }

    ]).then(function(response){
        //Set user responeses to the global search type and term variables
        searchType = response.type;
        searchTerm = response.term;
        //Next, call the same function as if they were entered from command line
        commandByArgv();
        
    });
}

commandByArgv();