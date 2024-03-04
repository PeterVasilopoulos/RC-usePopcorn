import {useEffect} from 'react'

export function useKey(key, action) {
    // escape keypress event listener
    useEffect(function() {
        function callback(e) {
            // convert code and key to lowercase incase of typo
            if(e.code.toLowerCase() === key.toLowerCase()) {
                action()
            }
        }

        document.addEventListener('keydown', callback)

        // removing event listener on component unmount
        return function() {
        document.removeEventListener('keydown', callback)
        }
    }, [action, key])
}