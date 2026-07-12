import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import useLocalStorage from './hooks/useLocalStorage'
import TodoList from './TodoList'
import EditTodoModal from './EditTodoModal'
import './App.css'

const LOCAL_STORAGE_KEY = 'honeydoApp.todos'
function App() {
  const [todos, setTodos] = useLocalStorage(
    LOCAL_STORAGE_KEY,
    [],
    Array.isArray
  )
  const [name, setName] = useState('')
  const [editingTodoId, setEditingTodoId] = useState(null)

  function setTodosComplete(complete) {
    setTodos((prevTodos) => {
      return prevTodos.map((todo) => ({ ...todo, complete }))
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') setName('')
  }

  function handleAddTodo(e) {
    e.preventDefault()
    const todoName = name.trim()
    if (todoName === '') return
    setTodos((prevTodos) => {
      return [...prevTodos, { id: uuidv4(), name: todoName, complete: false }]
    })
    setName('')
  }

  function handleClearTodo() {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.complete))
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

  const activeTodos = todos.filter((todo) => !todo.complete)
  const completeTodos = todos.filter((todo) => todo.complete)

  return (
    <div className="app">
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
        todos={activeTodos}
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
      <form className="addTodoRow" onSubmit={handleAddTodo}>
        <input
          className="todoInput"
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          onKeyDown={handleKeyDown}
        />
        <button
          className="addTodoButton"
          type="submit"
          disabled={name.trim() === ''}
        >
          Add Honey-Do
        </button>
      </form>
      <button className="clearAllButton" onClick={handleClearTodo}>
        Clear Complete
      </button>
      <div className="todosLeft">{activeTodos.length} left to do</div>
      {completeTodos.length > 0 && (
        <div className="completedSection">
          <h2 className="completedHeading">Completed</h2>
          <TodoList
            todos={completeTodos}
            toggleTodo={toggleTodo}
            editTodo={handleEditTodo}
            removeTodo={handleRemoveTodo}
          />
        </div>
      )}
    </div>
  )
}

export default App
