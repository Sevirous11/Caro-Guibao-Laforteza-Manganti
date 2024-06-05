const omdbApiKey = '7e6e9c26';
const tmdbApiKey = '97fd6a35d63efc758adae3d94056ac24';
let currentPage = 1;
let currentQuery = '';

const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

prevButton.style.display = 'none';
nextButton.style.display = 'none';

document.getElementById('searchButton').addEventListener('click', () => {
    currentQuery = document.getElementById('searchInput').value;
    currentPage = 1;
    if (currentQuery) {
        fetchMovies(currentQuery, currentPage);
    }
});

prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchMovies(currentQuery, currentPage);
    }
});

nextButton.addEventListener('click', () => {
    currentPage++;
    fetchMovies(currentQuery, currentPage);
});

function fetchMovies(query, page) {
    const omdbUrl = `https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${omdbApiKey}`;
    fetch(omdbUrl)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                displayMovies(data.Search);
                updatePagination(data.totalResults);
            } else {
                alert(data.Error);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function displayMovies(movies) {
    const moviesContainer = document.getElementById('movies');
    moviesContainer.innerHTML = '';

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.innerHTML = `
            <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300'}" alt="${movie.Title}">
            <h2>${movie.Title}</h2>
            <p>${movie.Year}</p>
        `;
        movieElement.addEventListener('click', () => fetchMovieDetails(movie.imdbID));
        moviesContainer.appendChild(movieElement);
    });
}

function updatePagination(totalResults) {
    if (totalResults > 10) {
        prevButton.style.display = 'inline-block';
        nextButton.style.display = 'inline-block';
    } else {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
    }
}

function fetchMovieDetails(imdbID) {
    const omdbUrl = `https://www.omdbapi.com/?i=${imdbID}&apikey=${omdbApiKey}`;
    fetch(omdbUrl)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                displayMovieDetails(data);
            } else {
                alert(data.Error);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function displayMovieDetails(movie) {
    const overlay = document.querySelector('.overlay');
    document.getElementById('moviePoster').src = movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300';
    document.getElementById('movieTitle').innerText = movie.Title;
    document.getElementById('moviePlot').innerText = movie.Plot;
    document.getElementById('movieDirector').innerText = movie.Director;
    document.getElementById('movieActors').innerText = movie.Actors;
    document.getElementById('movieGenre').innerText = movie.Genre;
    document.getElementById('movieIMDBRating').innerText = movie.imdbRating;
    document.getElementById('movieOverview').innerText = movie.Plot;

    const tmdbUrl = `https://api.themoviedb.org/3/find/${movie.imdbID}?api_key=${tmdbApiKey}&external_source=imdb_id`;
    fetch(tmdbUrl)
        .then(response => response.json())
        .then(data => {
            if (data.movie_results.length > 0) {
                const tmdbMovie = data.movie_results[0];
                document.getElementById('movieTMDbRating').innerText = tmdbMovie.vote_average;
            }
            else {
                document.getElementById('movieTMDbRating').innerText = 'N/A';
            }
        })
        .catch(error => {
            console.error('Error fetching TMDb rating:', error);
        });

    overlay.style.display = 'flex';
}

document.getElementById('closeButton').addEventListener('click', () => {
    document.querySelector('.overlay').style.display = 'none';
});


const homeLink = document.getElementById('homeLink');
homeLink.addEventListener('click', () => {
    window.location.reload();
});


const moviesLink = document.getElementById('moviesLink');
moviesLink.addEventListener('click', () => {
    fetchRandomMovies();
});

function fetchRandomMovies() {
    const tmdbUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${tmdbApiKey}&language=en-US&page=1`;

    fetch(tmdbUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const randomMovies = getRandomMovies(data.results, 3);
                displayRandomMovies(randomMovies);
            } else {
                console.error('No latest movies found.');
            }
        })
        .catch(error => {
            console.error('Error fetching latest movies:', error);
        });
}

function getRandomMovies(movies, count) {
    const shuffled = movies.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayRandomMovies(movies) {
    const randomMovieSection = document.getElementById('randomMovieSection');
    const randomMoviesContainer = document.getElementById('randomMovies');

    randomMoviesContainer.innerHTML = '';

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date}</p>
        `;
        randomMoviesContainer.appendChild(movieElement);
    });

    randomMovieSection.style.display = 'block';
}

const genresLink = document.getElementById('genresLink');

genresLink.addEventListener('click', () => {
    fetchGenres(); 
    
});

function fetchGenres() {
    const tmdbUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${tmdbApiKey}&language=en-US`;

    fetch(tmdbUrl)
        .then(response => response.json())
        .then(data => {
            if (data.genres && data.genres.length > 0) {
                displayGenres(data.genres);
            } else {
                console.error('No genres found.');
            }
        })
        .catch(error => {
            console.error('Error fetching genres:', error);
        });
}

function displayGenres(genres) {
    const genreSection = document.getElementById('genreSection');
    const genresContainer = document.getElementById('genres');

    genresContainer.innerHTML = '';

    genres.forEach(genre => {
        const genreButton = document.createElement('button');
        genreButton.textContent = genre.name;
        genreButton.addEventListener('click', () => {
            fetchMoviesByGenre(genre.id);
        });
        genresContainer.appendChild(genreButton);
    });

    genreSection.style.display = 'block';
}

function fetchMoviesByGenre(genreId) {
    const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${genreId}`;

    fetch(tmdbUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                displayMoviesByGenre(data.results);
            } else {
                console.error('No movies found for this genre.');
            }
        })
        .catch(error => {
            console.error('Error fetching movies by genre:', error);
        });
}

function displayMoviesByGenre(movies) {
    const genreMoviesContainer = document.getElementById('genreMovies');

    genreMoviesContainer.innerHTML = '';

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date}</p>
        `;
        genreMoviesContainer.appendChild(movieElement);
    });
}

function fetchMovieDetails(imdbID) {
    const omdbUrl = `https://www.omdbapi.com/?i=${imdbID}&apikey=${omdbApiKey}`;
    fetch(omdbUrl)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                fetchTMDbDetails(data.Title, data.Year);
                displayMovieDetails(data);
            } else {
                alert(data.Error);
            }
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
        });
}

function displayMovieDetails(movie) {
    document.getElementById('moviePoster').src = movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300';
    document.getElementById('movieTitle').textContent = movie.Title;
    document.getElementById('moviePlot').textContent = movie.Plot;
    document.getElementById('movieDirector').textContent = movie.Director;
    document.getElementById('movieActors').textContent = movie.Actors;
    document.getElementById('movieGenre').textContent = movie.Genre;
    document.getElementById('movieIMDBRating').textContent = movie.imdbRating;
    document.getElementById('movieOverview').textContent = movie.Plot;

    document.getElementById('trailerContainer').innerHTML = '';

    document.querySelector('.overlay').classList.add('active');

    document.getElementById('closeButton').addEventListener('click', () => {
        document.querySelector('.overlay').classList.remove('active');
    });
}

function fetchTMDbDetails(title, year) {
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${title}&year=${year}`;
    fetch(tmdbUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                const movie = data.results[0];
                displayTMDbDetails(movie);
                fetchTrailer(movie.id);
            }
        })
        .catch(error => {
            console.error('Error fetching TMDb data:', error);
        });
}

function displayTMDbDetails(movie) {
    document.getElementById('movieTMDbRating').textContent = movie.vote_average;
    document.getElementById('movieOverview').textContent = movie.overview;
}

function fetchTrailer(movieId) {
    const tmdbUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${tmdbApiKey}`;
    fetch(tmdbUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
                if (trailer) {
                    displayTrailer(trailer.key);
                }
            }
        })
        .catch(error => {
            console.error('Error fetching trailer:', error);
        });
}

function displayTrailer(trailerKey) {
    const trailerElement = document.createElement('div');
    trailerElement.innerHTML = `
        <iframe width="640" height="360" src="https://www.youtube.com/embed/${trailerKey}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
    document.getElementById('trailerContainer').appendChild(trailerElement);
}