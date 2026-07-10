import { useState } from 'react'

export default function EditTodoModal({ todo, onSave, onCancel }) {
  const [name, setName] = useState(todo.name)

  function handleSave() {
    const trimmed = name.trim()
    if (trimmed === '') return
    onSave(todo.id, trimmed)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSave}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
