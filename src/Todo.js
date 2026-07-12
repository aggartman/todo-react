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
    <div className="todo">
      <label className="todoLabel">
        <input
          className="todoCheckbox"
          type="checkbox"
          checked={todo.complete}
          onChange={handleTodoClick}
        />
        <span className="todoName">{todo.name}</span>
      </label>
      <button
        className="editButton"
        onClick={handleEditClick}
        aria-label={`Edit ${todo.name}`}
      >
        <FiFeather />
      </button>
      <button
        className="removeButton"
        onClick={handleRemoveClick}
        aria-label={`Remove ${todo.name}`}
      >
        <FiTrash2 />
      </button>
    </div>
  )
}
