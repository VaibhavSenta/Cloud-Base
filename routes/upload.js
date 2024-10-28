const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({ mergeParams: true });

// Varify Token
const { varifyToken } = require('../services/authentication');
const { verifyOttp } = require('../controllers/user');





// UPLOAD
router.get('/', async (req, res) => {
    console.log("GET request on Upload page..");
    return res.render("upload")
})


// POST ROUTES =================================================
router.post('/',varifyToken ,async (req, res) => {
    console.log("POST request on upload page..");

    const body = req.body;

    console.log(body);

    if (body) {
        console.log("Deta collected from user");

        console.log("Selected file Type is ", body.categori);

        const arr1 = ["movie", "trailer", "tvshow", "cartoon", "webseries", "song", "software", "operatingsystem", "image", "news", "app", "game"]
        console.log("Checking is this categori valid or not");

        arr1.forEach(categori => {
            console.log("Cheking ", categori, "...");
            if (body.categori === categori) {
                console.log("Categori is valid");

                // Fatch user frome Data Base
                function fatchUser() {

                    const { USER } = require('../models/user');

                    // const user = req.body.tokenUser
                    const user = req.tokenUser
                    

                    const profileUserName = user.userName

                    console.log(profileUserName);

                    return profileUserName;
                }

                const countries = [
                    "afghanistan", "albania", "algeria", "andorra", "angola", "antigua and barbuda", "argentina", "armenia", "australia", "austria",
                    "azerbaijan", "bahamas", "bahrain", "bangladesh", "barbados", "belarus", "belgium", "belize", "benin", "bhutan",
                    "bolivia", "bosnia and herzegovina", "botswana", "brazil", "brunei", "bulgaria", "burkina faso", "burundi", "cabo verde", "cambodia",
                    "cameroon", "canada", "central african republic", "chad", "chile", "china", "colombia", "comoros", "congo", "costa rica",
                    "croatia", "cuba", "cyprus", "czech republic", "denmark", "djibouti", "dominica", "dominican republic", "east timor", "ecuador",
                    "egypt", "el salvador", "equatorial guinea", "eritrea", "estonia", "eswatini", "ethiopia", "fiji", "finland", "france",
                    "gabon", "gambia", "georgia", "germany", "ghana", "greece", "grenada", "guatemala", "guinea", "guinea-bissau",
                    "guyana", "haiti", "honduras", "hungary", "iceland", "india", "indonesia", "iran", "iraq", "ireland",
                    "israel", "italy", "ivory coast", "jamaica", "japan", "jordan", "kazakhstan", "kenya", "kiribati", "korea, north",
                    "korea, south", "kuwait", "kyrgyzstan", "laos", "latvia", "lebanon", "lesotho", "liberia", "libya", "liechtenstein",
                    "lithuania", "luxembourg", "madagascar", "malawi", "malaysia", "maldives", "mali", "malta", "marshall islands", "mauritania",
                    "mauritius", "mexico", "micronesia", "moldova", "monaco", "mongolia", "montenegro", "morocco", "mozambique", "myanmar",
                    "namibia", "nauru", "nepal", "netherlands", "new zealand", "nicaragua", "niger", "nigeria", "north macedonia", "norway",
                    "oman", "pakistan", "palau", "panama", "papua new guinea", "paraguay", "peru", "philippines", "poland", "portugal",
                    "qatar", "romania", "russia", "rwanda", "saint kitts and nevis", "saint lucia", "saint vincent and the grenadines", "samoa", "san marino", "sao tome and principe",
                    "saudi arabia", "senegal", "serbia", "seychelles", "sierra leone", "singapore", "slovakia", "slovenia", "solomon islands", "somalia",
                    "south africa", "south sudan", "spain", "sri lanka", "sudan", "suriname", "sweden", "switzerland", "syria", "taiwan",
                    "tajikistan", "tanzania", "thailand", "togo", "tonga", "trinidad and tobago", "tunisia", "turkey", "turkmenistan", "tuvalu",
                    "uganda", "ukraine", "united arab emirates", "united kingdom", "united states", "uruguay", "uzbekistan", "vanuatu", "vatican city", "venezuela",
                    "vietnam", "yemen", "zambia", "zimbabwe"

                ];
                const audioTracks = [
                    "afrikaans", "albanian", "amharic", "arabic", "armenian", "assamese", "azerbaijani", "basque", "belarusian", "bengali",
                    "bosnian", "bulgarian", "catalan", "cebuano", "chichewa", "chinese", "corsican", "croatian", "czech", "danish",
                    "dutch", "english", "esperanto", "estonian", "filipino", "finnish", "french", "galician", "georgian", "german", "greek",
                    "gujarati", "haitian creole", "hausa", "hawaiian", "hebrew", "hindi", "hmong", "hungarian", "icelandic", "igbo",
                    "indonesian", "irish", "italian", "japanese", "javanese", "kannada", "kazakh", "khmer", "korean", "kurdish",
                    "kwanyama", "lao", "latin", "latvian", "lithuanian", "luxembourgish", "macedonian", "malagasy", "malay", "malayalam",
                    "maltese", "maori", "marathi", "mongolian", "myanmar (burmese)", "nepali", "norwegian", "pashto", "persian", "polish",
                    "portuguese", "punjabi", "romanian", "russian", "samoan", "scots gaelic", "serbian", "sesotho", "shona", "sindhi",
                    "sinhala", "slovak", "slovenian", "somali", "spanish", "sundanese", "swahili", "swedish", "tajik", "tamil",
                    "telugu", "thai", "turkish", "ukrainian", "urdu", "uzbek", "vietnamese", "welsh", "xhosa", "yiddish", "yoruba", "zulu"

                ]
                const subtitleTrack = [
                    "afrikaans", "albanian", "amharic", "arabic", "armenian", "assamese", "azerbaijani", "basque", "belarusian", "bengali",
                    "bosnian", "bulgarian", "catalan", "cebuano", "chichewa", "chinese", "corsican", "croatian", "czech", "danish",
                    "dutch", "english", "esperanto", "estonian", "filipino", "finnish", "french", "galician", "georgian", "german", "greek",
                    "gujarati", "haitian creole", "hausa", "hawaiian", "hebrew", "hindi", "hmong", "hungarian", "icelandic", "igbo",
                    "indonesian", "irish", "italian", "japanese", "javanese", "kannada", "kazakh", "khmer", "korean", "kurdish",
                    "kwanyama", "lao", "latin", "latvian", "lithuanian", "luxembourgish", "macedonian", "malagasy", "malay", "malayalam",
                    "maltese", "maori", "marathi", "mongolian", "myanmar (burmese)", "nepali", "norwegian", "pashto", "persian", "polish",
                    "portuguese", "punjabi", "romanian", "russian", "samoan", "scots gaelic", "serbian", "sesotho", "shona", "sindhi",
                    "sinhala", "slovak", "slovenian", "somali", "spanish", "sundanese", "swahili", "swedish", "tajik", "tamil",
                    "telugu", "thai", "turkish", "ukrainian", "urdu", "uzbek", "vietnamese", "welsh", "xhosa", "yiddish", "yoruba", "zulu"

                ]

                const profileUserName = fatchUser()

                return res.render(`upload${categori}`, {
                    userName: profileUserName,
                    countries: countries
                });

            } else {
                return res.status(5000)
            }

        });


    } else {
        return console.log("No data collected from user");


    }




})

// Upload movie
router.post('/movie', varifyToken,async (req, res)=>{

    console.log("New request at movie upload....");
    const activeUser = req.tokenUser
    
    console.log("Active user: " + activeUser);

    const body = req.body

    console.log("REQUEST BODY :",body);

    const movie = {
        title: body.title,
        description: body.discription,
        releaseDate: body.releaseDate,
        cast: body.cast,
        director: body.director,
        duration: body.hour+":"+ body.minutes+":"+body.seconds,
        size: body.size,
        releasedInCountry: body.releasedInCountry,
        audioTrack: body.audioTrack,
        subtitleTrack: body.subtitleTrack,
        resolutions: body.resolutions,

        categori: body.searchCatagory,
        // poster:
        trailer: body.trailer,
        // databasepath
        uploadedBy: activeUser.email

    }

    
    const ucbid = "abc"

    console.log("Server side movie OBJ :", movie);
    
    

    return res.json({msg: "Data collected"})
    
})



module.exports = {
    uploadRouter: router
}