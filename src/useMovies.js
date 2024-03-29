import {useEffect, useState} from 'react'

const KEY = 'ef5b7d46'

export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // api fetch on user search event listener
    useEffect(function() {
        // optional chaining on callback function
        // callback?.()

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
        // handleCloseMovie()

        fetchMovies()

        return function() {
        controller.abort()
        }
    }, [query])

    // return state variables
    return {movies, isLoading, error}
}