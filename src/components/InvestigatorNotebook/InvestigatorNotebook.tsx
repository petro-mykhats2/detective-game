import { useState } from "react"
import {
  useInvestigatorNotebook,
  type InvestigationNote,
  type NotebookStatus,
  type WitnessContradiction,
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
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
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

function NoteCard({ note, onRemove }: { note: InvestigationNote; onRemove: (id: string) => void }) {
  return (
    <article className="investigator-notebook__note">
      <div className="investigator-notebook__note-top">
        <NotebookStatusBadge status={note.status} />
        <button type="button" className="investigator-notebook__delete"
          onClick={() => onRemove(note.id)} aria-label={`Видалити нотатку «${note.title}»`} title="Видалити нотатку">×</button>
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

function ContradictionCard({ item, onRemove }: { item: WitnessContradiction; onRemove: (id: string) => void }) {
  return (
    <article className="investigator-notebook__note investigator-notebook__contradiction">
      <div className="investigator-notebook__note-top">
        <span className={`investigator-notebook__status ${item.status === "розв'язано" ? "investigator-notebook__status--approved" : "investigator-notebook__status--pending"}`}>
          <span aria-hidden="true" />
          {item.status === "розв'язано" ? "Розв'язано" : "Очікує"}
        </span>
        <button type="button" className="investigator-notebook__delete"
          onClick={() => onRemove(item.id)} aria-label="Видалити запис про суперечність" title="Видалити запис">×</button>
      </div>
      <h3>Свідок: {item.witness}</h3>
      <p><strong>Цитата:</strong> {item.quote}</p>
      <p><strong>Документ:</strong> {item.document}</p>
      <p><strong>Чому:</strong> {item.why}</p>
      <div className="investigator-notebook__note-meta">
        <span>НЕВДАЛИХ СПРОБ: {item.failedAttempts}</span>
        <span>ПІДКАЗОК: {item.hintsUsed}</span>
        <span>МАКС. РІВЕНЬ: {item.maxHintLevel}</span>
        <time dateTime={item.createdAt}>ЗАПИСАНО {formatDate(item.createdAt)}</time>
        <time dateTime={item.updatedAt}>ОНОВЛЕНО {formatDate(item.updatedAt)}</time>
      </div>
    </article>
  )
}

export default function InvestigatorNotebook() {
  const {
    notes, removeNote, clearNotes, contradictions, removeContradiction, clearContradictions,
    isOpen, closeNotebook,
  } = useInvestigatorNotebook()
  const [filter, setFilter] = useState<"all" | NotebookStatus>("all")
  const visibleNotes = filter === "all" ? notes : notes.filter((note) => note.status === filter)

  return (
    <>
      {isOpen && (
        <div className="investigator-notebook__backdrop" role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeNotebook() }}>
          <section className="investigator-notebook" role="dialog" aria-modal="true" aria-labelledby="investigator-notebook-title">
            <header className="investigator-notebook__header">
              <div className="investigator-notebook__header-mark">
                <span className="investigator-notebook__paperclip" aria-hidden="true" />
                <div>
                  <span className="investigator-notebook__eyebrow">СЛІДЧА ГРУПА · РОБОЧИЙ БЛОКНОТ</span>
                  <h2 id="investigator-notebook-title">План слідства</h2>
                </div>
              </div>
              <button type="button" className="investigator-notebook__close" onClick={closeNotebook} aria-label="Закрити блокнот">×</button>
            </header>

            <div className="investigator-notebook__toolbar">
              <div className="investigator-notebook__summary">
                <strong>{notes.length + contradictions.length}</strong>
                <span>записів у справі</span>
              </div>
              <div className="investigator-notebook__filters" aria-label="Фільтр нотаток">
                {FILTERS.map((item) => (
                  <button key={item.value} type="button" className={filter === item.value ? "is-active" : ""}
                    onClick={() => setFilter(item.value)}>{item.label}</button>
                ))}
              </div>
            </div>

            <div className="investigator-notebook__paper">
              <div className="investigator-notebook__paper-lines" aria-hidden="true" />
              {visibleNotes.length > 0 ? (
                <div className="investigator-notebook__list">
                  {visibleNotes.map((note) => <NoteCard key={note.id} note={note} onRemove={removeNote} />)}
                </div>
              ) : notes.length > 0 && filter !== "all" ? (
                <div className="investigator-notebook__empty"><h3>Записів за цим фільтром немає</h3></div>
              ) : null}

              <section className="investigator-notebook__contradictions-section" aria-label="Суперечності у показаннях">
                <div className="investigator-notebook__contradictions-heading">
                  <span>ОКРЕМЕ ДОРУЧЕННЯ</span>
                  <h3>Суперечності у показаннях</h3>
                </div>
                {contradictions.length > 0 ? (
                  <div className="investigator-notebook__list">
                    {contradictions.map((item) => <ContradictionCard key={item.id} item={item} onRemove={removeContradiction} />)}
                  </div>
                ) : (
                  <p className="investigator-notebook__contradictions-empty">Поки що суперечностей не зафіксовано.</p>
                )}
              </section>
            </div>

            <footer className="investigator-notebook__footer">
              <span><i /> Дані зберігаються локально на цьому пристрої</span>
              {(notes.length > 0 || contradictions.length > 0) && (
                <button type="button" className="investigator-notebook__clear"
                  onClick={() => {
                    if (window.confirm("Очистити весь блокнот слідчої групи?")) {
                      clearNotes()
                      clearContradictions()
                    }
                  }}>Очистити блокнот</button>
              )}
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
