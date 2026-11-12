import { useEffect, useRef, useState, type FormEvent } from "react"
import vehicles from "../../baza_danych_avto.json"
import { useVehicleSearch } from "./VehicleSearchContext"
import { useInvestigatorNotebook } from "../InvestigatorNotebook/InvestigatorNotebookContext"
import {
  getActionMessage,
  getNotebookEntryText,
  ownerName,
  type VehicleAction,
} from "./vehicleActionUtils"
import "./VehicleSearchModal.css"

type Vehicle = (typeof vehicles)[number]

function normalize(value: string) {
  return value.toLocaleLowerCase("uk-UA").replace(/[\s\-_.]/g, "").trim()
}

export default function VehicleSearchModal() {
  const { isOpen, closeVehicleSearch } = useVehicleSearch()
  const { notes, addNote } = useInvestigatorNotebook()
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const searchTimerRef = useRef<number | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pendingActionKeysRef = useRef(new Set<string>())
  const [actionMessageByPlate, setActionMessageByPlate] = useState<Record<string, string>>({})

  function normalizeNotebookValue(value: string) {
    return normalize(value)
  }

  function findExistingNotebookNote(vehicle: Vehicle) {
    const plate = normalizeNotebookValue(vehicle.plate)
    const name = normalizeNotebookValue(ownerName(vehicle))
    return notes.find((note) => {
      const structuredPlate = note.plate ? normalizeNotebookValue(note.plate) : ""
      const structuredOwner = note.ownerName ? normalizeNotebookValue(note.ownerName) : ""
      if (structuredPlate && structuredPlate === plate) return true
      if (structuredOwner && structuredOwner === name) return true

      const text = [note.title, note.details, note.source].filter(Boolean).join(" ")
      const normalizedText = normalizeNotebookValue(text)
      return normalizedText.includes(plate) || normalizedText.includes(name)
    })
  }

  function getActionLabel(action: VehicleAction) {
    if (action === "interrogate") return "допит"
    if (action === "suspicion") return "клопотання про підозру"
    return "розшук / орієнтування"
  }

  function handleVehicleAction(vehicle: Vehicle, action: VehicleAction) {
    if (action === "wanted") {
      setActionMessageByPlate((current) => ({
        ...current,
        [vehicle.plate]: getActionMessage(vehicle, action),
      }))
      return
    }

    if (findExistingNotebookNote(vehicle)) return

    const key = `${normalize(vehicle.plate)}::${normalize(ownerName(vehicle))}`
    if (pendingActionKeysRef.current.has(key)) return
    pendingActionKeysRef.current.add(key)

    addNote({
      title: getNotebookEntryText(vehicle, action),
      status: "pending",
      source: "НАІС МВС",
      plate: vehicle.plate,
      ownerName: ownerName(vehicle),
      action,
    })

    window.setTimeout(() => pendingActionKeysRef.current.delete(key), 0)

    setActionMessageByPlate((current) => ({
      ...current,
      [vehicle.plate]: getActionMessage(vehicle, action),
    }))
  }

  const matches = submittedQuery
    ? (vehicles as Vehicle[])
        .filter((vehicle) => {
          const needle = normalize(submittedQuery)
          return [vehicle.plate, vehicle.brand, vehicle.owner].some((value) =>
            normalize(value).includes(needle),
          )
        })
        .slice(0, 12)
    : []

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = "hidden"
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 80)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeVehicleSearch()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, closeVehicleSearch])

  useEffect(() => {
    return () => {
      if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current)
    }
  }, [])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = query.trim()
    if (!value) {
      setSearchError("Введіть номерний знак, марку, модель або прізвище власника.")
      setSubmittedQuery("")
      return
    }

    setSearchError("")
    setIsSearching(true)
    setSubmittedQuery("")

    if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current)
    searchTimerRef.current = window.setTimeout(() => {
      setSubmittedQuery(value)
      setIsSearching(false)
      searchTimerRef.current = null
    }, 2000)
  }

  function closeModal() {
    setQuery("")
    setSubmittedQuery("")
    setSearchError("")
    setIsSearching(false)
    if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current)
    searchTimerRef.current = null
    closeVehicleSearch()
  }

  if (!isOpen) return null

  return (
    <div
      className="vehicle-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal()
      }}
    >
      <section
        className="vehicle-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-modal-title"
      >
        <header className="vehicle-modal__header">
          <div>
            <span className="vehicle-modal__eyebrow">НАІС МВС · ЗАХИЩЕНИЙ КАНАЛ</span>
            <h2 id="vehicle-modal-title">Пошук транспортного засобу</h2>
            <p>Введіть відомі дані, щоб отримати відповідний запис із бази.</p>
          </div>
          <button className="vehicle-modal__close" type="button" onClick={closeModal} aria-label="Закрити вікно">×</button>
        </header>

        <form className="vehicle-search" onSubmit={submitSearch}>
          <label htmlFor="vehicle-query">НОМЕРНИЙ ЗНАК / МАРКА / МОДЕЛЬ / ПРІЗВИЩЕ</label>
          <div className="vehicle-search__controls">
            <input ref={searchInputRef} id="vehicle-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Напр. ВІ 3412 ВА або Renault…" autoComplete="off" />
            <button type="submit" disabled={isSearching}>{isSearching ? "Пошук…" : "Перевірити"}</button>
          </div>
          {searchError && <p className="vehicle-search__error" role="alert">{searchError}</p>}
          <span className="vehicle-search__hint">Пошук не чутливий до регістру та пробілів.</span>
        </form>

        <div className="vehicle-results" aria-live="polite">
          {isSearching ? (
            <div className="vehicle-searching" role="status" aria-live="polite">
              <div className="vehicle-searching__scanner"><span /></div>
              <strong>Виконується запит до реєстру</strong>
              <p>Перевіряємо реєстраційні дані та історію транспортного засобу…</p>
              <div className="vehicle-searching__track"><i /></div>
              <span className="vehicle-searching__timer">ЗАХИЩЕНИЙ КАНАЛ · ЗАПИТ ОБРОБЛЯЄТЬСЯ</span>
            </div>
          ) : !submittedQuery ? (
            <div className="vehicle-results__empty"><span>⌕</span><strong>Очікується запит</strong><p>Результати з'являться після введення даних і натискання «Перевірити».</p></div>
          ) : matches.length ? (
            <>
              <div className="vehicle-results__caption">ЗНАЙДЕНО ЗАПИСІВ: {matches.length}{matches.length === 12 ? "+" : ""}</div>
              {matches.map((vehicle) => (
                <article className="vehicle-record" key={vehicle.plate}>
                  <div className="vehicle-record__top">
                    <div><span className="vehicle-record__eyebrow">РЕЄСТРАЦІЙНИЙ НОМЕР</span><h3>{vehicle.plate}</h3></div>
                    <span className="vehicle-record__status"><i /> ЗАПИС ЗНАЙДЕНО</span>
                  </div>
                  <div className="vehicle-record__vehicle">
                    <div className="vehicle-record__icon" aria-hidden="true">▰</div>
                    <div><strong>{vehicle.brand}</strong><span>{vehicle.type} · {vehicle.year} р.в.</span></div>
                    <div className="vehicle-record__color"><span>КОЛІР</span><strong>{vehicle.color}</strong></div>
                  </div>
                  <div className="vehicle-record__grid">
                    <div><span>ВЛАСНИК</span><strong>{vehicle.owner}</strong></div>
                    <div><span>ТИП ВЛАСНИКА</span><strong>{vehicle.ownerType}</strong></div>
                    <div className="vehicle-record__address"><span>АДРЕСА РЕЄСТРАЦІЇ</span><strong>{vehicle.address}</strong></div>
                    <div><span>VIN-КОД</span><strong>{vehicle.vin}</strong></div>
                    <div><span>СТАТУС РЕЄСТРАЦІЇ</span><strong>{vehicle.registration?.status} ({vehicle.registration?.date})</strong></div>
                    <div><span>СТРАХУВАННЯ</span><strong>{vehicle.insurance?.company} ({vehicle.insurance?.status} до {vehicle.insurance?.validUntil})</strong></div>
                    <div><span>ТЕХОГЛЯД</span><strong>{vehicle.techInspection?.status} до {vehicle.techInspection?.validUntil}</strong></div>
                  </div>
                  {vehicle.fines && vehicle.fines.length > 0 && (
                    <div className="vehicle-record__info">
                      <span>ШТРАФИ ТА ПОРУШЕННЯ ({vehicle.fines.length})</span>
                      <ul style={{ marginTop: "4px", paddingLeft: "16px", fontSize: "8.5pt" }}>
                        {(vehicle.fines as Array<{ date: string; violation: string; article: string; amount: number; status: string }>).map((fine, idx: number) => (
                          <li key={idx}>
                            {fine.date} — {fine.violation} ({fine.article}, {fine.amount} грн) — <b>{fine.status}</b>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(() => {
                    const existingNote = findExistingNotebookNote(vehicle)
                    const actionMessage = actionMessageByPlate[vehicle.plate]
                    const disabled = Boolean(existingNote)
                    const marker = existingNote?.status === "rejected"
                      ? "Відхилено"
                      : existingNote
                        ? `Додано до блокнота: ${existingNote.action ? getActionLabel(existingNote.action) : "дію"}`
                        : actionMessage

                    return (
                      <div className="vehicle-record__actions">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleVehicleAction(vehicle, "interrogate")}
                        >
                          Викликати на допит власника
                        </button>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleVehicleAction(vehicle, "suspicion")}
                        >
                          Підготувати клопотання про підозру
                        </button>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleVehicleAction(vehicle, "wanted")}
                        >
                          Подати в розшук / орієнтування
                        </button>
                        {marker && (
                          <p className={existingNote?.status === "rejected" ? "vehicle-record__action-note vehicle-record__action-note--rejected" : existingNote ? "vehicle-record__action-note vehicle-record__action-note--added" : "vehicle-record__action-note"}>
                            {marker}
                          </p>
                        )}
                      </div>
                    )
                  })()}
                </article>
              ))}
            </>
          ) : (
            <div className="vehicle-results__empty vehicle-results__empty--not-found"><span>!</span><strong>Збігів не знайдено</strong><p>Перевірте написання номера, марки, моделі або прізвища та повторіть пошук.</p></div>
          )}
        </div>

        <footer className="vehicle-modal__footer">
          <span>НАВЧАЛЬНА БАЗА ДАНИХ · СПРАВА № 001</span>
          <button type="button" onClick={closeModal}>Закрити</button>
        </footer>
      </section>
    </div>
  )
}
