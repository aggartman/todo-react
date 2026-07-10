import React from 'react'
import { FiTrash2, FiFeather } from 'react-icons/fi'

export default function Todo({ todo, toggleTodo, removeTodo, editTodo }) {
  function handleTodoClick() {
    toggleTodo(todo.id)
  }

  function handleRemoveClick() {
    removeTodo(todo.id)
  }

  function handleEditClick() {
    editTodo(todo.id)
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={todo.complete}
          onChange={handleTodoClick}
        />
        {todo.name}
      </label>
      <button onClick={handleEditClick} aria-label={`Edit ${todo.name}`}>
        <FiFeather />
      </button>
      <button onClick={handleRemoveClick} aria-label={`Remove ${todo.name}`}>
        <FiTrash2 />
      </button>
    </div>
  )
}
