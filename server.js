'use strict'

require("dotenv").config();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
const express = require('express');
const data = require('./Movie Data/data.json');
const app = express();
const axios = require("axios");
const cors = require('cors');
app.use(cors());
app.use(express.json());
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
app.get('/getMovies', handleGetMovies);
app.post("/addMovie", addMovieHandler);
app.delete("/DELETE/:id", deleteMoviesHandler);
app.put("/UPDATE/:id", updateMoviesHandler);
app.get('/getMovie/:id', handleGetMovie);


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
        return new Movies(item.id, item.title, item.releasedate, item.posterpath, item.overview);
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


async function handleReviews(req, res) {
    const reviewId = req.query.reviewId;// try this: 58aa82f09251416f92006a3a 
    const url = `https://api.themoviedb.org/3/review/${reviewId}?api_key=${moviesKey}`;
    let reviewData = await axios.get(url);
    // let review = new MoviesReview(reviewData.data.id, reviewData.data.author, reviewData.data.url,reviewData.data.rating,reviewData.data.content,reviewData.data.date);
    res.send(reviewData.data);

}

function handleGetMovies(req, res) {
    const sql = 'select * from topmovies;';
    client.query(sql)
        .then((data) => {
            let dataFromDB = data.rows.map((item) => {
                let singleMovie = new Movies(
                    item.id,
                    item.title,
                    item.releasedate,
                    item.posterpath,
                    item.overview
                )
                return singleMovie;
            });
            res.send(dataFromDB);
        })
        .catch((error) => {
            res.status(500).send(error, "error");
        });
}

function addMovieHandler(req, res) {
    const movie = req.body;
    const sql = `INSERT into topmovies (title, releasedate, posterpath, overview) values ($1,$2,$3,$4) RETURNING *;`;
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview];
    client.query(sql, values).then((data) => {
        res.send(data.rows);
        //res.send("Adding succ");
    })
    .catch((error) => {
        res.status(500).send(error, "error");
    });
}
function updateMoviesHandler(req, res) {
    const id = req.params.id;
    const sql = `update topmovies set title=$1,releasedate=$2,posterpath=$3,overview=$4 where id=${id} returning *`;
    const values = [req.body.title, req.body.releasedate, req.body.posterpath, req.body.overview];
    client.query(sql, values)
        .then((data) => {
            res.status(200).send(data.rows);
        })
        .catch((error) => {
            res.status(500).send(error, "error");
        });
}

function deleteMoviesHandler(req, res) {
    // http://localhost:3001/DELETE/anyNumber(related to id)
    const movieId = req.params.id;
    const sql = `delete from topmovies where id = ${movieId}`;
    client.query(sql)
        .then((data) => {
            if (data)
                res.status(202).send('deleted');
        })
        .catch((error) => {
            res.status(500).send(error, "error");
        });
}

function handleGetMovie(req, res) {
    const movieId = req.params.id;
    const sql = `select * from topmovies  where id=${movieId}`;
    client.query(sql)
        .then((data) => {
            res.status(200).send(data.rows);
        })
        .catch((error) => {
            res.status(500).send(error, "error");
        });
}
app.use((req, res) => {
    res.status(404).send('Page Not Found Error');
});




app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something went wrong!')
})

client.connect().then(() => {
    app.listen(port, () => {
        console.log('ready and listen on port', port);
    });
})
.catch((error) => {
    res.status(500).send(error, "error");
});
