import { useEffect, useState, useRef } from "react";
import StarRating from './StarRating'

const average = (arr) => {
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
}

const KEY = 'ef5b7d46'

// ------------------------------------
// App
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(function() {
    const storedValue = localStorage.getItem('watched')
    return JSON.parse(storedValue)
  });


  function handleSelectMovie(id) {
    setSelectedId(selectedId =>id === selectedId ? null : id)
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie])

    // storing data in local storage
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]))
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id))
  }

  // storing data in local storage
  useEffect(function() {
    localStorage.setItem('watched', JSON.stringify(watched))
  }, [watched])

  // api fetch on user search event listener
  useEffect(function() {
    const controller = new AbortController()

    async function fetchMovies() {
      try {
        setIsLoading(true)
        // reset error
        setError('')
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          {signal: controller.signal}
        )

        if(!res.ok) {
          throw new Error("Something went wrong with fetching movies")
        } 

        const data = await res.json()

        if(data.Response === 'False') {
          throw new Error("Movie not found")
        }

        setMovies(data.Search)
        setError('')
    } catch (err) {
        if(err.name !== "AbortError") {
          console.log(err.message)
          setError(err.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if(query.length < 3) {
      setMovies([])
      setError('')
      return
    }

    // close movie on new search
    handleCloseMovie()

    fetchMovies()

    return function() {
      controller.abort()
    }
  }, [query])

  


  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList 
            movies={movies} 
            onSelectMovie={handleSelectMovie} 
          />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {
            selectedId ? 
              <MovieDetails 
                selectedId={selectedId} 
                onCloseMovie={handleCloseMovie}
                onAddWatched={handleAddWatched}
                watched={watched}
              />
            : 
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList 
                watched={watched} 
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          }
        </Box>
      </Main>
    </>
  );
}  

// ------------------------------------
// Loader
function Loader() {
  return (
    <p className="loader">Loading...</p>
  )
}

// ------------------------------------
// Error Message
function ErrorMessage({message}) {
  return (
    <p className="error">
      <span>❌</span> {message}
    </p>
  )
}

// ------------------------------------
// NavBar
function NavBar({children}) {

  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
}

// ------------------------------------
// Num Results
function NumResults({movies}) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

// ------------------------------------
// Logo
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

// ------------------------------------
// Search
function Search({query, setQuery}) {
  const inputEl = useRef(null)

  useEffect(function() {

    function callback(e) {
      if(document.activeElement === inputEl.current) {
        return
      }

      if(e.code === 'Enter') {
        inputEl.current.focus()
        setQuery('')
      }
    }

    document.addEventListener('keydown', callback)

    return function() {
      document.removeEventListener('keydown', callback)
    }
  }, [setQuery])

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  )
}

// ------------------------------------
// Main
function Main({children}) {
  return (
    <main className="main">
        {children}
      </main>
  )
}

// ------------------------------------
// List Box
function Box({children}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && (
        children
      )}
    </div>
  )
}

/*
// ------------------------------------
// Watched Box
function WatchedBox() {
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          
        </>
      )}
    </div>
  )
}
*/

// ------------------------------------
// Movie List
function MovieList({movies, onSelectMovie}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie 
          movie={movie} 
          key={movie.imdbID} 
          onSelectMovie={onSelectMovie}
        />
      ))}
    </ul>
  )
}
// ------------------------------------
// Individual Movie
function Movie({movie, onSelectMovie}) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

// ------------------------------------
// Movie Details
function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState('')

  const isWatched = watched.map((movie) => 
    movie.imdbID).includes(selectedId)

  const watchedUserRating = watched.find((movie) => 
    movie.imdbID === selectedId)?.userRating

  // destructuring data to remove uppercase
  const {
    Title: title, 
    Year: year, 
    Poster: poster, 
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating: Number(userRating)
    }

    onAddWatched(newWatchedMovie)
    onCloseMovie()
  }
  
  // escape keypress event listener
  useEffect(function() {
    function callback(e) {
      if(e.code === 'Escape') {
        onCloseMovie()
        console.log('CLOSING')
      }
    }

    document.addEventListener('keydown', callback)

    // removing event listener on component unmount
    return function() {
      document.removeEventListener('keydown', callback)
    }
  }, [onCloseMovie])

  useEffect(function() {
    async function getMovieDetails() {
      setIsLoading(true)
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      )
      const data = await res.json()
      setMovie(data)
      setIsLoading(false)
    }
    getMovieDetails()
  }, [selectedId])

  useEffect(function() {
    if(!title) {
      return
    }

    document.title = `Movie | ${title}`

    // cleanup function
    return function() {
      document.title = 'usePopcorn'
    }
  }, [title])

  return ( 
    <div className="details">
      {
      isLoading ? 
        <Loader /> 
      :
        <>
          <header>
            <img src={poster} alt={`Poster for ${movie}`} />
            
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull; {runtime}</p>
              <p>{genre}</p>
              <p><span>⭐</span> {imdbRating} IMDb Rating</p>
            </div>

            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
          </header>

          <section>
            <div className="rating">
              {
                !isWatched ?
                  <>
                  <StarRating 
                  maxRating={10} 
                  size={24} 
                  onSetRating={setUserRating}
                />

                {
                  userRating > 0 && (
                  <button 
                    className="btn-add"
                    onClick={handleAdd}
                  >
                    + Add to list
                  </button>
                )}
                </>
                :
                <p>
                  You rated this movie {watchedUserRating} <span>⭐</span>
                </p>
              }
            </div>

            <p><em>{plot}</em></p>
            <p>Starring: {actors}</p>
            <p>Directed by: {director}</p>
          </section>
        </>
      }

    </div>
  )
}

// ------------------------------------
// Watched Summary
function WatchedSummary({watched}) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movie{watched.length === 1 ? '' : 's'}</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

// ------------------------------------
// Watched Movies List
function WatchedMoviesList({watched, onDeleteWatched}) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie 
          movie={movie} 
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  )
}

// ------------------------------------
// Watched Movie
function WatchedMovie({movie, onDeleteWatched}) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button 
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >X</button>
      </div>
    </li>
  )
}