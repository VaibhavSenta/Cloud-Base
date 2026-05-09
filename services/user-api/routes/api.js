const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});






// Auth routes =============================================================================
const {AUTH} = require('./auth.route');
router.use('/auth', AUTH);



// Home Route
const { homeRoute } = require('./home.route')
router.use(`/home`, homeRoute)













// User Router
// const { userRouter } = require('./routes/user');
// router.use('/', userRouter)


// // UPLOAD Route
// const { uploadRouter } = require('./routes/upload');
// router.use('/upload', uploadRouter)



// // Admin routes
// const { adminRouter } = require('./routes/admin');
// router.use('/admin', adminRouter);










// // MOVIE route
// const { movieRouter } = require('./routes/movies');
// router.use('/movies', movieRouter)

// // GAME route
// const { gameRouter } = require('./routes/games');
// router.use('/games', gameRouter)

// // MUSIC route
// app.get('/music', async (req, res) =>{
//     console.log("New request to music route");
//     return res.send("========================================== This page is unavailable now =============================")
// })

// // WALLPAPER route
// app.get('/wallpapers', async (req, res) =>{
//     console.log("New request to wallpapers route");
//     return res.send("========================================== This page is unavailable now =============================")
// })









// // Profile Route
// const { profileRouter } = require('./routes/profile');
// router.use('/:profile', profileRouter)

// // Download route
// const { downloadRouter } = require('./routes/download');
// router.use('/download', downloadRouter)

// // POST Request

// const { userSignup } = require('./controllers/user');
// app.post('/signup', userSignup)


// // Post request for login
// const { userLogin } = require('./controllers/user');
// const { hostname } = require('os');
// app.post('/login', userLogin)











module.exports = {
    API: router
}