DROP TABLE IF EXISTS topmovies;
CREATE TABLE IF NOT EXISTS topmovies(
id SERIAL PRIMARY KEY ,
title varchar(255),
releasedate varchar(255),
posterpath varchar(255),
overview varchar(1000)
);

