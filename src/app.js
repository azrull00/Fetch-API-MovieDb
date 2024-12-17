import { baseUrl, apiToken, imageUrl } from "./config.js";

const nowPlayingEndpoint = `${baseUrl}/movie/now_playing`;
const searchMovieEndpoint = (query) => `${baseUrl}/search/movie?query=${query}`;
const movieDetailEndpoint = (movieId) => `${baseUrl}/movie/${movieId}?`;

const fetchOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiToken}`,
  },
};

const FetchMovieDetail = {
  async: true,
  crossDomain: true,
  url: movieDetailEndpoint(),
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${apiToken}`,
  }
};


const contentElm = document.querySelector("#content");
const app = () => {
  const displayLoading = (state) => {
    if (state) {
      contentElm.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-center" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
      </div>
        `;
    }
  };

  const displayMovies =  async (movies) => {
    let moviesTemplate = `
        <div class="row row-cols-1 row-cols-md-3 g-2 g-4">
        `;
    if (movies.length < 1) {
      displayAlert("Data tidak ditemukan");
      return false;
    }

    movies.forEach((movie) => {
      const { id, original_title, overview, poster_path } = movie;
      moviesTemplate += `
            <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="card h-100">
              <img src="${imageUrl}${poster_path}" class="card-img-top" alt="..." />
              <div class="card-body">
                <h5 class="card-title">${original_title}</h5>
                <p class="card-text truncate">
                  ${overview}
                </p>
                <a href="#" data-id="${id}" class="card-link">Detil</a>
              </div>
            </div>
          </div>
            `;
            
    });
    moviesTemplate += `</div>`;
    contentElm.innerHTML = moviesTemplate;
  };


  const getNowPlayingList = async () => {
    displayLoading(true);
    fetch(nowPlayingEndpoint, fetchOptions)
      .then((response) => response.json())
      .then((responseJson) => displayMovies(responseJson.results))
      .catch((error) => console.error(error));
      
  };


  const displayAlert = (message) => {
    contentElm.innerHTML = `<div class="alert alert-warning" role="alert">
    ${message}
  </div>`;
  };
  const searchBtn = document.querySelector("#btnSearch");
  const searchText = document.querySelector("#searchInput");


  searchText.addEventListener("input", function (event) {
    if (this.value.length < 1) getNowPlayingList();
  });

  searchText.addEventListener("keydown", function (event) {
    if (
      this.value.length > 0 &&
      (event.key === "Enter" || event.keyCode === 13)
    ) {
      event.preventDefault();
      searchMovies();
    }
  });

  searchBtn.addEventListener("click", function (event) {
    event.preventDefault();
    if (searchText.value.length > 1) searchMovies();
  });


  const searchMovies = async () => {
    displayLoading(true);
    try {
      const movieList = await fetch(
        searchMovieEndpoint(searchText.value),
        fetchOptions
      );
      const responseJson = await movieList.json();
      displayMovies(responseJson.results);
      console.log(responseJson.results);
    } catch (error) {
      console.log(error);
      displayAlert("Terjadi error saat mengambil data");
    }
  };


// Ketika User klik pada bagian card-link akan Menampilkan detail
  contentElm.addEventListener("click", function (event) {
    if (event.target.classList.contains("card-link")) {
        console.log(this.target);
      const movieId = event.target.dataset.id;
      // memanggil fungsi untuk menampilkan detail
      displayMovieDetail(movieId);
    }
  });
  window.addEventListener("DOMContentLoaded", getNowPlayingList);
  
  // Fungsi Detail Movie 
  const displayMovieDetail = async (movieId) => {
    displayLoading(true); // Menampilkan animasi loading
    try {

      // Fetch data detail film berdasarkan movieId
      const response = await fetch(movieDetailEndpoint(movieId), FetchMovieDetail);
      const movie = await response.json();
      console.log(movie);
      console.log(movieId);
  
      // Destrukturisasi data film
      const {
        title,
        overview,
        poster_path,
        release_date,
        vote_average,
        status,
        genres,
        runtime,
        tagline,
      } = movie;
  
      // Template HTML untuk detail film
      contentElm.innerHTML = `
        <div class="row">
          <div class="col-md-4">
            <img src="${imageUrl}${poster_path}" alt="${title}" class="img-fluid rounded">
          </div>
          <div class="col-md-8">
            <h2>${title}</h2>
            <p><strong>Tagline:</strong> ${tagline} </p>
            <p><strong>Tanggal Rilis:</strong> ${release_date}</p>
            <p><strong>Rating:</strong> ${vote_average} / 10</p>
            <p><strong>Genre : </strong> ${genres.map((genre) => genre.name).join(", ")}</p>          
            <p><strong>Telah Diputar Sebanyak : </strong> ${runtime} x </p>
            <p><strong>Status:</strong> ${status} </p>
            <p>${overview}</p>
            <button id="btnBack" class="btn btn-primary">Kembali</button>
          </div>
        </div>
      `;
  
      // Event listener untuk tombol kembali
      document.querySelector("#btnBack").addEventListener("click", () => {
        getNowPlayingList(); // Kembali ke daftar film
      });
    } catch (error) {
      console.error(error);
      displayAlert("Gagal menampilkan detail film");
    }
  };


};

export default app;
