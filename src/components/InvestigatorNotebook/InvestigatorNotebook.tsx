import { useState } from "react"
import {
  useInvestigatorNotebook,
  type InvestigationNote,
  type NotebookStatus,
} from "./InvestigatorNotebookContext"
import "./InvestigatorNotebook.css"

const STATUS_META: Record<NotebookStatus, { label: string; tone: string }> = {
  "in-progress": { label: "В процесі перевірки", tone: "progress" },
  rejected: { label: "Відхилено", tone: "rejected" },
  completed: { label: "Опрацьовано", tone: "completed" },
  "awaiting-conclusion": { label: "Чекає на висновок", tone: "waiting" },
  "decision-made": { label: "Є рішення", tone: "decision" },
  "cannot-complete": { label: "Неможливо виконати", tone: "blocked" },
  "awaiting-conditions": { label: "Чекає на виконання умов", tone: "conditions" },
  pending: { label: "Очікує", tone: "pending" },
  approved: { label: "Погоджено", tone: "approved" },
}

const FILTERS: Array<{ value: "all" | NotebookStatus; label: string }> = [
  { value: "all", label: "Усі" },
  { value: "in-progress", label: "В процесі" },
  { value: "pending", label: "Очікують" },
  { value: "approved", label: "Погоджено" },
  { value: "awaiting-conclusion", label: "Висновки" },
  { value: "completed", label: "Опрацьовано" },
  { value: "decision-made", label: "Рішення" },
  { value: "rejected", label: "Відхилено" },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function NotebookStatusBadge({ status }: { status: NotebookStatus }) {
  const meta = STATUS_META[status]

  return (
    <span className={`investigator-notebook__status investigator-notebook__status--${meta.tone}`}>
      <span aria-hidden="true" />
      {meta.label}
    </span>
  )
}

function NoteCard({
  note,
  onRemove,
}: {
  note: InvestigationNote
  onRemove: (id: string) => void
}) {
  return (
    <article className="investigator-notebook__note">
      <div className="investigator-notebook__note-top">
        <NotebookStatusBadge status={note.status} />
        <button
          type="button"
          className="investigator-notebook__delete"
          onClick={() => onRemove(note.id)}
          aria-label={`Видалити нотатку «${note.title}»`}
          title="Видалити нотатку"
        >
          ×
        </button>
      </div>

      <h3>{note.title}</h3>

      {note.details && <p>{note.details}</p>}

      <div className="investigator-notebook__note-meta">
        {note.source && <span>ДЖЕРЕЛО: {note.source}</span>}
        <time dateTime={note.updatedAt}>ОНОВЛЕНО {formatDate(note.updatedAt)}</time>
      </div>
    </article>
  )
}

export default function InvestigatorNotebook() {
  const { notes, removeNote, clearNotes, isOpen, closeNotebook } = useInvestigatorNotebook()
  const [filter, setFilter] = useState<"all" | NotebookStatus>("all")

  const visibleNotes =
    filter === "all" ? notes : notes.filter((note) => note.status === filter)

  return (
    <>
      {isOpen && (
        <div
          className="investigator-notebook__backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeNotebook()
          }}
        >
          <section
            className="investigator-notebook"
            role="dialog"
            aria-modal="true"
            aria-labelledby="investigator-notebook-title"
          >
            <header className="investigator-notebook__header">
              <div className="investigator-notebook__header-mark">
                <span className="investigator-notebook__paperclip" aria-hidden="true" />
                <div>
                  <span className="investigator-notebook__eyebrow">
                    СЛІДЧА ГРУПА · РОБОЧИЙ БЛОКНОТ
                  </span>
                  <h2 id="investigator-notebook-title">План слідства</h2>
                </div>
              </div>

              <button
                type="button"
                className="investigator-notebook__close"
                onClick={closeNotebook}
                aria-label="Закрити блокнот"
              >
                ×
              </button>
            </header>

            <div className="investigator-notebook__toolbar">
              <div className="investigator-notebook__summary">
                <strong>{notes.length}</strong>
                <span>записів у справі</span>
              </div>

              <div className="investigator-notebook__filters" aria-label="Фільтр нотаток">
                {FILTERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={filter === item.value ? "is-active" : ""}
                    onClick={() => setFilter(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="investigator-notebook__paper">
              <div className="investigator-notebook__paper-lines" aria-hidden="true" />

              {visibleNotes.length > 0 ? (
                <div className="investigator-notebook__list">
                  {visibleNotes.map((note) => (
                    <NoteCard key={note.id} note={note} onRemove={removeNote} />)
                  )}
                </div>
              ) : (
                <div className="investigator-notebook__empty">
                  <div className="investigator-notebook__empty-icon">✎</div>
                  <h3>Записів поки немає</h3>
                  <p>
                    Додавайте експертизи, допити, обшуки та інші слідчі дії
                    безпосередньо зі сцен гри.
                  </p>
                </div>
              )}
            </div>

            <footer className="investigator-notebook__footer">
              <span>
                <i /> Дані зберігаються локально на цьому пристрої
              </span>

              {notes.length > 0 && (
                <button
                  type="button"
                  className="investigator-notebook__clear"
                  onClick={() => {
                    if (window.confirm("Очистити весь блокнот слідчої групи?")) {
                      clearNotes()
                    }
                  }}
                >
                  Очистити блокнот
                </button>
              )}
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
