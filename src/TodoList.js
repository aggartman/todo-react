import React from 'react'
import Todo from './Todo'

export default function TodoList({ todos, toggleTodo, editTodo, removeTodo }) {
  return (
    <div className="todoGrid">
      {todos.map((todo) => (
        <Todo
          key={todo.id}
          toggleTodo={toggleTodo}
          editTodo={editTodo}
          removeTodo={removeTodo}
          todo={todo}
        />
      ))}
    </div>
  )
}
