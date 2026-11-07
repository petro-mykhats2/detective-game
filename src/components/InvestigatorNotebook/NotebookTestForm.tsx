import { useState, type FormEvent } from "react"
import { useInvestigatorNotebook, type NotebookStatus } from "./InvestigatorNotebookContext"
import "./NotebookTestForm.css"

const STATUS_OPTIONS: { value: NotebookStatus; label: string }[] = [
  { value: "pending", label: "Чекає на виконання" },
  { value: "in-progress", label: "В процесі перевірки" },
  { value: "awaiting-conclusion", label: "Чекає на висновок" },
  { value: "awaiting-conditions", label: "Чекає на виконання умов" },
  { value: "completed", label: "Опрацьовано" },
  { value: "decision-made", label: "Є рішення" },
  { value: "rejected", label: "Відхилено" },
  { value: "cannot-complete", label: "Неможливо виконати" },
]

export default function NotebookTestForm() {
  const { addNote } = useInvestigatorNotebook()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("Призначити додаткову експертизу")
  const [details, setDetails] = useState("Перевірити механізм утворення тілесних ушкоджень та зіставити висновок з іншими матеріалами справи.")
  const [status, setStatus] = useState<NotebookStatus>("in-progress")
  const [saved, setSaved] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    addNote({ title, details, status, source: "Тест блокнота · Головний екран" })
    setSaved(true)
    setIsOpen(false)
  }

  return (
    <>
      <button className="notebook-test-trigger" type="button" onClick={() => { setSaved(false); setIsOpen(true) }}>
        <span aria-hidden="true">＋</span> ТЕСТ · ДОДАТИ ЗАПИС У БЛОКНОТ
      </button>

      {isOpen && (
        <div className="notebook-test-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}>
          <section className="notebook-test-dialog" role="dialog" aria-modal="true" aria-labelledby="notebook-test-title">
            <div className="notebook-test-heading">
              <div>
                <span>ІНСТРУМЕНТ СЛІДЧОГО · ТЕСТ</span>
                <h2 id="notebook-test-title">Новий запис у блокнот</h2>
              </div>
              <button type="button" className="notebook-test-close" aria-label="Закрити форму" onClick={() => setIsOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="notebook-test-note-title">НАЗВА ЗАВДАННЯ</label>
              <input id="notebook-test-note-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={140} />
              <label htmlFor="notebook-test-note-details">ДЕТАЛІ / ЩО ПОТРІБНО ПЕРЕВІРИТИ</label>
              <textarea id="notebook-test-note-details" value={details} onChange={(event) => setDetails(event.target.value)} rows={4} />
              <label htmlFor="notebook-test-note-status">СТАТУС ВИКОНАННЯ</label>
              <select id="notebook-test-note-status" value={status} onChange={(event) => setStatus(event.target.value as NotebookStatus)}>
                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <div className="notebook-test-actions">
                <button type="button" className="notebook-test-cancel" onClick={() => setIsOpen(false)}>Скасувати</button>
                <button type="submit" className="notebook-test-save">ДОДАТИ ДО БЛОКНОТА</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {saved && <span className="notebook-test-saved" role="status">Запис додано до блокнота</span>}
    </>
  )
}
