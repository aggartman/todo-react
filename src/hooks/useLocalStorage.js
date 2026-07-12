import { useState, useEffect } from 'react'
export default function useLocalStorage(key, defaultValue, validate) {
  const [value, setValue] = useState(() => {
    const item = window.localStorage.getItem(key)
    if (!item) return defaultValue
    try {
      const parsedItems = JSON.parse(item)
      if (validate && !validate(parsedItems)) return defaultValue
      return parsedItems
    } catch (error) {
      console.error('Error parsing localStorage item: ', error)
      console.log('Removing invalid localStorage item for key: ', key)
      window.localStorage.removeItem(key)
      return defaultValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
