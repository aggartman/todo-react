import React, { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import TodoList from './TodoList'
import EditTodoModal from './EditTodoModal'

const LOCAL_STORAGE_KEY = 'honeydoApp.todos'
function App() {
  const [todos, setTodos] = useState([])
  const todoNameRef = useRef()
  const [editingTodoId, setEditingTodoId] = useState(null)

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

  function setTodosComplete(complete) {
    setTodos((prevTodos) => {
      return prevTodos.map((todo) => ({ ...todo, complete }))
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAddTodo()
    if (e.key === 'Escape') todoNameRef.current.value = ''
  }

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

  function handleEditTodo(id) {
    setEditingTodoId(id)
  }

  function handleSaveEdit(id, newName) {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, name: newName } : todo
      )
    )
    setEditingTodoId(null)
  }

  function handleRemoveTodo(id) {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))
  }

  return (
    <>
      <h1 className="appTitle">Honey-Do List</h1>
      <label className="markAllLabel">
        <input
          className="markAllCheckbox"
          type="checkbox"
          checked={todos.length > 0 && todos.every((todo) => todo.complete)}
          onChange={(e) => setTodosComplete(e.target.checked)}
        />
        Mark All Complete
      </label>
      <TodoList
        todos={todos}
        toggleTodo={toggleTodo}
        editTodo={handleEditTodo}
        removeTodo={handleRemoveTodo}
      />
      {editingTodoId !== null && (
        <EditTodoModal
          todo={todos.find((todo) => todo.id === editingTodoId)}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTodoId(null)}
        />
      )}
      <input
        className="todoInput"
        ref={todoNameRef}
        type="text"
        onKeyDown={handleKeyDown}
      />
      <button className="addTodoButton" onClick={handleAddTodo}>
        Add Honey-Do
      </button>
      <button className="clearAllButton" onClick={handleClearTodo}>
        Clear Complete
      </button>
      <div className="todosLeft">
        {todos.filter((todo) => !todo.complete).length} left to do
      </div>
    </>
  )
}

export default App
