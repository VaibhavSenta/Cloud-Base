const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const router = express.Router({ mergeParams: true });

// Varify Token
const { varifyToken } = require("../services/authentication");
const { verifyOttp } = require("../controllers/user");

// UPLOAD
router.get("/", async (req, res) => {
  console.log("GET request on Upload page..");
  return res.render("upload");
});

// POST ROUTES =================================================
router.post("/", varifyToken, async (req, res) => {
  console.log("POST request on upload page..");

  const body = req.body;

  console.log(body);

  if (body) {
    console.log("Deta collected from user");

    console.log("Selected file Type is ", body.categori);

    const arr1 = [
      "movie",
      "trailer",
      "tvshow",
      "cartoon",
      "webseries",
      "song",
      "software",
      "operatingsystem",
      "image",
      "news",
      "app",
      "game",
    ];
    console.log("Checking is this categori valid or not");

    arr1.forEach((categori) => {
      console.log("Cheking ", categori, "...");
      if (body.categori === categori) {
        console.log("Categori is valid");

        // Fatch user frome Data Base
        function fatchUser() {
          const { USER } = require("../models/user");

          // const user = req.body.tokenUser
          const user = req.tokenUser;

          const profileUserName = user.userName;

          console.log(profileUserName);

          return profileUserName;
        }

        const countries = [
          "afghanistan",
          "albania",
          "algeria",
          "andorra",
          "angola",
          "antigua and barbuda",
          "argentina",
          "armenia",
          "australia",
          "austria",
          "azerbaijan",
          "bahamas",
          "bahrain",
          "bangladesh",
          "barbados",
          "belarus",
          "belgium",
          "belize",
          "benin",
          "bhutan",
          "bolivia",
          "bosnia and herzegovina",
          "botswana",
          "brazil",
          "brunei",
          "bulgaria",
          "burkina faso",
          "burundi",
          "cabo verde",
          "cambodia",
          "cameroon",
          "canada",
          "central african republic",
          "chad",
          "chile",
          "china",
          "colombia",
          "comoros",
          "congo",
          "costa rica",
          "croatia",
          "cuba",
          "cyprus",
          "czech republic",
          "denmark",
          "djibouti",
          "dominica",
          "dominican republic",
          "east timor",
          "ecuador",
          "egypt",
          "el salvador",
          "equatorial guinea",
          "eritrea",
          "estonia",
          "eswatini",
          "ethiopia",
          "fiji",
          "finland",
          "france",
          "gabon",
          "gambia",
          "georgia",
          "germany",
          "ghana",
          "greece",
          "grenada",
          "guatemala",
          "guinea",
          "guinea-bissau",
          "guyana",
          "haiti",
          "honduras",
          "hungary",
          "iceland",
          "india",
          "indonesia",
          "iran",
          "iraq",
          "ireland",
          "israel",
          "italy",
          "ivory coast",
          "jamaica",
          "japan",
          "jordan",
          "kazakhstan",
          "kenya",
          "kiribati",
          "korea, north",
          "korea, south",
          "kuwait",
          "kyrgyzstan",
          "laos",
          "latvia",
          "lebanon",
          "lesotho",
          "liberia",
          "libya",
          "liechtenstein",
          "lithuania",
          "luxembourg",
          "madagascar",
          "malawi",
          "malaysia",
          "maldives",
          "mali",
          "malta",
          "marshall islands",
          "mauritania",
          "mauritius",
          "mexico",
          "micronesia",
          "moldova",
          "monaco",
          "mongolia",
          "montenegro",
          "morocco",
          "mozambique",
          "myanmar",
          "namibia",
          "nauru",
          "nepal",
          "netherlands",
          "new zealand",
          "nicaragua",
          "niger",
          "nigeria",
          "north macedonia",
          "norway",
          "oman",
          "pakistan",
          "palau",
          "panama",
          "papua new guinea",
          "paraguay",
          "peru",
          "philippines",
          "poland",
          "portugal",
          "qatar",
          "romania",
          "russia",
          "rwanda",
          "saint kitts and nevis",
          "saint lucia",
          "saint vincent and the grenadines",
          "samoa",
          "san marino",
          "sao tome and principe",
          "saudi arabia",
          "senegal",
          "serbia",
          "seychelles",
          "sierra leone",
          "singapore",
          "slovakia",
          "slovenia",
          "solomon islands",
          "somalia",
          "south africa",
          "south sudan",
          "spain",
          "sri lanka",
          "sudan",
          "suriname",
          "sweden",
          "switzerland",
          "syria",
          "taiwan",
          "tajikistan",
          "tanzania",
          "thailand",
          "togo",
          "tonga",
          "trinidad and tobago",
          "tunisia",
          "turkey",
          "turkmenistan",
          "tuvalu",
          "uganda",
          "ukraine",
          "united arab emirates",
          "united kingdom",
          "united states",
          "uruguay",
          "uzbekistan",
          "vanuatu",
          "vatican city",
          "venezuela",
          "vietnam",
          "yemen",
          "zambia",
          "zimbabwe",
        ];
        const audioTracks = [
          "English",
          "Spanish",
          "French",
          "German",
          "Italian",
          "Portuguese",
          "Russian",
          "Mandarin Chinese",
          "Cantonese",
          "Japanese",
          "Arabic",
          "Hindi",
          "Korean",
          "Dutch",
          "Turkish",
          "Greek",
          "Polish",
          "Swedish",
          "Danish",
          "Finnish",
          "Norwegian",
          "Hungarian",
          "Czech",
          "Bulgarian",
          "Romanian",
          "Hebrew",
          "Tamil",
          "Telugu",
          "Bengali",
          "Malay",
          "Thai",
          "Vietnamese",
          "Indonesian",
          "Filipino (Tagalog)",
          "Ukrainian",
          "Serbian",
          "Croatian",
          "Slovak",
          "Lithuanian",
          "Estonian",
        ];
        const subtitleTrack = [
          "English",
          "Spanish",
          "French",
          "German",
          "Italian",
          "Portuguese",
          "Russian",
          "Mandarin Chinese",
          "Cantonese",
          "Japanese",
          "Arabic",
          "Hindi",
          "Korean",
          "Dutch",
          "Turkish",
          "Greek",
          "Polish",
          "Swedish",
          "Danish",
          "Finnish",
          "Norwegian",
          "Hungarian",
          "Czech",
          "Bulgarian",
          "Romanian",
          "Hebrew",
          "Tamil",
          "Telugu",
          "Bengali",
          "Malay",
          "Thai",
          "Vietnamese",
          "Indonesian",
          "Filipino (Tagalog)",
          "Ukrainian",
          "Serbian",
          "Croatian",
          "Slovak",
          "Lithuanian",
          "Estonian",
          "Lithuanian",
          "Albanian",
          "Georgian",
          "Macedonian",
          "Latvian",
          "Slovenian",
          "Kazakh",
          "Armenian",
          "Pashto",
          "Urdu",
          "Burmese",
          "Nepali",
          "Sinhalese",
          "Haitian Creole",
          "Yiddish",
          "Icelandic",
          "Belarusian",
          "Malayalam",
          "Gujarati",
          "Punjabi",
          "Marathi",
          "Bhojpuri",
          "Sinhala",
          "Xhosa",
          "Zulu",
          "Afrikaans",
        ];
        const resolutions = [
            "480p", "576p", "720p", "1080p", "1440p", "4K", "5K", "6K", "8K", "10K"
        ]

        const profileUserName = fatchUser();

        // return res.render(`upload${categori}`, {
        //     userName: profileUserName,
        //     countries: countries
        // });

        return res.render(`uploadmovie`, {
          userName: profileUserName,
          countries: countries,
          audioTracks: audioTracks,
          subtitleTrack: subtitleTrack,
          resolutions: resolutions
        });
      } else {
        return res.status(5000);
      }
    });
  } else {
    return console.log("No data collected from user");
  }
});

// Upload movie details
router.post("/movie/detail", varifyToken, async (req, res) => {
  console.log("New request at movie upload....");
  const activeUser = req.tokenUser;

  console.log("Active user: " + activeUser);

  if (!req.body) {
    return res.status(500).json({ msg: "No data collected from user, there are some problem reciving form data" });
  } else {
    
        const body = req.body;
        const releaseDate = new Date(body.releaseDate).toDateString()
        console.log("=======",releaseDate);

        console.log("REQUEST BODY :", body);
        const movieTitle = body.title.toUpperCase()
        const movie = {
            title: movieTitle,
            titleName: body.title,
            description: body.description,
            releaseDate: releaseDate,
            details: releaseDate.split(" ")[3] + " " + "Movie" + " " + body.resolutions ,
            cast: body.cast,
            director: body.director,
            duration: body.hour + ":" + body.minutes + ":" + body.seconds,
            // size: body.size,
            releasedInCountry: body.releasedInCountry,
            audioTrack: body.audioTrack,
            subtitleTrack: body.subtitleTrack,
            resolutions: body.resolutions,
            trailer: body.trailer,
            // categori: body.searchCatagory,
            // poster:
            // trailer: body.trailer,
            // databasepath
            uploadedBy: activeUser.email,
          };

        // Making ucb-id
        const shortUniqueId = require('short-unique-id');
        const uuid = new shortUniqueId({length:20})
        
        movie.ucbid = uuid.rnd()
        
        console.log("Server side movie OBJ :", movie);
            
        // Check if movie alredy avalable in database
        const {MOVIE} = require('../models/movies');
        const movieInDb = await MOVIE.find({ title: movieTitle });
        console.log("MOVIE IN DB IS ::", movieInDb)
        if (movieInDb.length === 0) {
            
            console.log("You can upload movie");
            // const newMovie = await MOVIE.create(movie);

            // Make a cooki for the movie object
            
            console.log("You will be redirected for file and poster upload");
            
            function fatchUser() {
                const { USER } = require("../models/user");
      
                // const user = req.body.tokenUser
                const user = req.tokenUser;
      
                const profileUserName = user.userName;
      
                console.log(profileUserName);
      
                return profileUserName;
            }

            const profileUserName = fatchUser();
            return res.cookie("moviedetails",movie).render("uploadmoviefile.ejs", {
                userName: profileUserName,
            })
        } else {
            
            console.log("Mvie alredy in database....");
            return res.send("Movie alredy in database")
        }
        
        return res.json({ msg: "Data collected" });
    }





});








const fs = require('fs');
const multer = require('multer');
const path = require("path");
const filePath = path.join('./uploads')


const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null,filePath)
  },
  filename: (req, file, cb)=>{
    cb(null,Date.now()+path.extname(file.originalname))
  }
})

const upload = multer({storage: storage})

router.post("/movie/files", varifyToken,
upload.fields([{name: 'poster', maxCount:1},{name: 'moviefile', maxCount:1}]),
async(req, res)=>{
  
  console.log("==========================================================================");

  console.log("UPLOADED BODY :::",req.body);
  if(req.files) {
    console.log("File recived");
    console.log("UPLOADED FILES :::",req.files);
    const fileSize = req.files.moviefile[0].size
    console.log("UPLOADED FILES SIZE :::",fileSize);

    
    console.log("==========================================================================");
    // Get movie details from cookie moviedetails
    const movieDetails = req.cookies.moviedetails;
    const filePathResolver = path.resolve(req.files.moviefile[0]. path)
    const filePathRelative = path.relative(__dirname, filePathResolver)
    
    const posterFilePathResolver = path.resolve(req.files.poster[0]. path)
    const posterFilePathRelative = path.relative(__dirname, posterFilePathResolver)

    // Adding extra details
    movieDetails.size = fileSize
    movieDetails.poster = posterFilePathRelative
    movieDetails.databasepath = filePathRelative
    movieDetails.originalFileData = req.files.moviefile[0]
    
    console.log("Movie Details :::",movieDetails);
    // Save movie details to database
    const { MOVIE } = require('../models/movies');
    const uploadMovie = await MOVIE.create(movieDetails)
    console.log("Movie uploaded to database");

    return res.status(200).clearCookie("moviedetails").send("Movie uploaded successfully .....")

  } else {
    console.log("File not recived");
    return res.send("Please send file..")
  }


})

module.exports = {
  uploadRouter: router,
};
