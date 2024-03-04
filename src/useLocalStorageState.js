import {useState, useEffect} from 'react'

export function useLocalStorageState(initialState, key) {
    // creating state and pulling existing value from local storage
    const [value, setValue] = useState(function() {
        const storedValue = localStorage.getItem(key)
        
        // before return, check if there is previous stored data
        // if not, return initialState argument
        return storedValue ? JSON.parse(storedValue) : initialState
    });

    // storing data in local storage
    useEffect(function() {
        localStorage.setItem(key, JSON.stringify(value))
    }, [value, key])

    // return array with value and setValue
    return [value, setValue]
}