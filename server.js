'use strict'
require("dotenv").config();
const express = require('express');
const data = require('./Movie Data/data.json');
const app = express();
const axios = require("axios");
const cors = require('cors');
app.use(cors());

const moviesKey = process.env.API_KEY;
const port = process.env.PORT;

let result = [];
function Movies(id, title, releaseDate, posterPath, overview) {
    this.id = id;
    this.title = title;
    this.releaseDate = releaseDate;
    this.posterPath = posterPath;
    this.overview = overview;
    // result.push(this);
}
//routes
app.get('/', handleHome);
app.get('/favorite', handleFavorite);
app.get('/trending', handleTrending);
app.get('/search', handleSearch);
app.get('/companies', handleCompanies)
app.get('/reviews', handleReviews)



// handlers
function handleHome(req, res) {
    // console.log("any thing");
    let movie = new Movies(data.id, data.title, data.release_date, data.poster_path, data.overview);
    res.json(movie);
    // res.send({msg:'welcome to home page'})
}


function handleFavorite(req, res) {
    res.send('Welcome to Favorite Page');
};

async function handleTrending(req, res) {
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${moviesKey}&language=en-US`;

    let moviesFromAPI = await axios.get(url);
    let movies = moviesFromAPI.data.results.map((item) => {
        return new Movies(item.id, item.title, item.release_date, item.poster_path, item.overview);
    })
    res.send(movies);

};

function handleSearch(req, res) {
    //the query from the frontend
    const movieName = req.query.name;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${moviesKey}&language=en-US&query=${movieName}`;
    axios.get(url)
        .then((result) => {
            // console.log(result.data);
            res.send(result.data.results.map((item) => {
                return new Movies(item.id, item.title, item.release_date, item.poster_path, item.overview);
            }))
        })
        .catch((error) => {
            res.status(500).send(error, "error");
        });
}

async function handleCompanies(req, res) {
    const companyId = req.query.companyId;// any number 1 or 2 or 3, etc

    const url = `https://api.themoviedb.org/3/company/${companyId}?api_key=${moviesKey}`;
    let companyData = await axios.get(url);
    res.send(companyData.data);

}

// function MoviesReview(id, author,url, rating, date, content) {
//     this.id = id;
//     this.author = author;
//     this.url = url;
//     this.rating = rating;
//     this.date = date;
//     this.content = content;
//     // result.push(this);
// }

async function handleReviews(req, res) {
    const reviewId = req.query.reviewId;// try this: 58aa82f09251416f92006a3a 
    const url = `https://api.themoviedb.org/3/review/${reviewId}?api_key=${moviesKey}`;
    let reviewData = await axios.get(url);
    // let review = new MoviesReview(reviewData.data.id, reviewData.data.author, reviewData.data.url,reviewData.data.rating,reviewData.data.content,reviewData.data.date);
    res.send(reviewData.data);

}


app.use((req, res) => {
    res.status(404).send('Page Not Found Error');
});




app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something went wrong!')
})

app.listen(port, () => {
    console.log(`server is listing on port ${port}`);

})
