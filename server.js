'use strict'
const express = require('express');
const data = require('./Movie Data/data.json');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
    let result = [];
    function Movies(title, posterPath, overview) {
        this.title = title;
        this.posterPath = posterPath;
        this.overview = overview;
        result.push(this);
    }
    let movie = new Movies(data.title, data.poster_path, data.overview);
    res.json(movie);
})
app.listen(port, () => {
    console.log(`server is listing on port ${port}`);
    
})

app.get('/favorite', (req, res) => {
    res.send('Welcome to Favorite Page');
});


app.use((req, res)=>{
    res.status(404).send('Page Not Found Error');
});




app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something went wrong!')
  })

