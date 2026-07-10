import React, { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import TodoList from './TodoList'

const LOCAL_STORAGE_KEY = 'honeydoApp.todos'
function App() {
  const [todos, setTodos] = useState([])
  const todoNameRef = useRef()

  useEffect(() => {
    const rawStorageTodos = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!rawStorageTodos) return

    try {
      setTodos(JSON.parse(rawStorageTodos))
    } catch (error) {
      console.error('Error parsing todos from localStorage: ', error)
      console.log('Resetting todos')
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  function handleAddTodo(e) {
    const name = todoNameRef.current.value.trim()
    if (name === '') return
    setTodos((prevTodos) => {
      return [...prevTodos, { id: uuidv4(), name: name, complete: false }]
    })
    todoNameRef.current.value = ''
  }

  function handleClearTodo() {
    const newTodos = todos.filter((todo) => !todo.complete)
    setTodos(newTodos)
  }

  function toggleTodo(id) {
    setTodos((prevTodos) => {
      return prevTodos.map((todo) =>
        todo.id === id ? { ...todo, complete: !todo.complete } : todo
      )
    })
  }

  return (
    <>
      <TodoList todos={todos} toggleTodo={toggleTodo} />
      <input ref={todoNameRef} type="text" />
      <button onClick={handleAddTodo}>Add Honey-Do</button>
      <button onClick={handleClearTodo}>Clear Complete</button>
      <div>{todos.filter((todo) => !todo.complete).length} left to do</div>
    </>
  )
}

export default App
