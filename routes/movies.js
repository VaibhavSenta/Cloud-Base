const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});

// Varify Token
const { varifyToken } = require('../services/authentication');


router.use('/uploads', express.static("uploads"))

// GET routes =========================================================================
router.get('/', varifyToken, async (req, res) => {
    console.log("New request to movie route");

    const { USER } = require('../models/user');
    const { MOVIE, } = require('../models/movies');


    const user = req.tokenUser
    const profileUserName = user.userName

    // collect all movies from MOVIE
    const allMovies = await MOVIE.find({})

    // render movies page with user name and movie list
    return res.render("movies",{
        userName: profileUserName,
        movies: allMovies
    })


})

router.get('/:ucbid',varifyToken ,async(req, res) => {
    console.log("New request to movie route");
    
    console.log("Requesr perams:", req.params)
    const ucbid = req.params.ucbid

    const { MOVIE } = require('../models/movies');
    const movie = await MOVIE.findOne({ucbid: ucbid})

    console.log("UCBID MOVIE :",movie);
    // render movie page with user name and movie details
    return res.render("movie",{
        userName: req.tokenUser.userName,
        movie: movie
    })
    
})






module.exports = {
    movieRouter: router
}