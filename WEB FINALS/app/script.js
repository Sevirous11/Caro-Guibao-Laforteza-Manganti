const omdbApiKey = '7e6e9c26';
const tmdbApiKey = '97fd6a35d63efc758adae3d94056ac24';
let currentPage = 1;
let currentQuery = '';

const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const homeLink = document.getElementById('homeLink');

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

homeLink.addEventListener('click', () => {
    // Add your desired functionality here
    alert("Welcome to MovieHub!"); // Example: Show a welcome message
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
    if (totalResults > 10 * currentPage) {
        nextButton.style.display = 'inline-block';
    } else {
        nextButton.style.display = 'none';
    }

    if (currentPage > 1) {
        prevButton.style.display = 'inline-block';
    } else {
        prevButton.style.display = 'none';
    }
}


function fetchMovieDetails(imdbID) {
    const omdbUrl = `https://www.omdbapi.com/?i=${imdbID}&apikey=${omdbApiKey}`;
    fetch(omdbUrl)
        .then(response => response.json())
        .then(data => {
            displayMovieDetails(data);
            fetchTMDbDetails(data.Title, data.Year);
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

    document.getElementById('trailerContainer').innerHTML = '';

    document.querySelector('.overlay').classList.add('active');

    document.getElementById('closeButton').addEventListener('click', () => {
        document.querySelector('.overlay').classList.remove('active');
        document.querySelector('.movie-details').innerHTML = `
            <span id="closeButton" class="close-button">&times;</span>
            <div class="details-container">
                <div class="poster-container">
                    <img id="moviePoster" src="" alt="Movie Poster">
                    <div id="trailerContainer" class="trailer-container"></div>
                </div>
                <div class="text-details">
                    <h2 id="movieTitle"></h2>
                    <p id="moviePlot"></p>
                    <p><strong>Director:</strong> <span id="movieDirector"></span></p>
                    <p><strong>Actors:</strong> <span id="movieActors"></span></p>
                    <p><strong>Genre:</strong> <span id="movieGenre"></span></p>
                    <p><strong>IMDB Rating:</strong> <span id="movieIMDBRating"></span></p>
                    <p><strong>TMDb Rating:</strong> <span id="movieTMDbRating"></span></p>
                    <p><strong>Overview:</strong> <span id="movieOverview"></span></p>
                </div>
            </div>
        `;
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
