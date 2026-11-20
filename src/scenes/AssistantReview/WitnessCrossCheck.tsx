import { useEffect, useState } from "react"
import { useInvestigatorNotebook } from "../../components/InvestigatorNotebook/InvestigatorNotebookContext"
import { WITNESS_CROSS_CHECK_CONFIG as config } from "../../config/witnessCrossCheck"
import { WITNESS_CROSS_CHECK_CASE_KEY as caseKey } from "../../config/witnessCrossCheckCaseKey"
import "./WitnessCrossCheck.css"

type Step = "intro" | "suspect" | "suspect-feedback" | "evidence" | "success"
type CrossCheckState = {
  isOpen: boolean
  step: Step
  witnessOrder: string[]
  quoteOrder: string[]
  selectedWitness: string
  selectedQuoteId: string
  selectedDocumentId: string
  why: string
  failedAttempts: number
  hintsUsed: number
  maxHintLevel: number
  currentHint: number
  feedback: string
  savedRecordId: string | null
}

const STORAGE_KEY = "detective-witness-cross-check-state-v1"

function shuffle<T,>(values: readonly T[]): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function createInitialState(): CrossCheckState {
  return {
    isOpen: true,
    step: "intro",
    witnessOrder: shuffle(config.witnesses),
    quoteOrder: shuffle(config.quotes.map((quote) => quote.id)),
    selectedWitness: "",
    selectedQuoteId: "",
    selectedDocumentId: "",
    why: "",
    failedAttempts: 0,
    hintsUsed: 0,
    maxHintLevel: 0,
    currentHint: 0,
    feedback: "",
    savedRecordId: null,
  }
}

function readState(): CrossCheckState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const saved = JSON.parse(raw) as Partial<CrossCheckState>
    const fallback = createInitialState()
    return {
      ...fallback,
      ...saved,
      witnessOrder: Array.isArray(saved.witnessOrder) ? saved.witnessOrder : fallback.witnessOrder,
      quoteOrder: Array.isArray(saved.quoteOrder) ? saved.quoteOrder : fallback.quoteOrder,
    }
  } catch {
    return createInitialState()
  }
}

function getHintLevel(state: CrossCheckState) {
  return Math.min(3, Math.max(state.failedAttempts + 1, state.maxHintLevel + 1))
}

export default function WitnessCrossCheck({ actionAvailable }: { actionAvailable: boolean }) {
  const { upsertContradiction, updateContradiction } = useInvestigatorNotebook()
  const [state, setState] = useState<CrossCheckState>(readState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Стан завдання залишається доступним у межах поточної сесії.
    }
  }, [state])

  if (!actionAvailable) return null

  function patch(next: Partial<CrossCheckState>) {
    setState((current) => ({ ...current, ...next }))
  }

  function requestHint() {
    const level = getHintLevel(state)
    if (state.maxHintLevel >= 3) return
    patch({ currentHint: level, maxHintLevel: level, hintsUsed: state.hintsUsed + 1 })
  }

  function chooseWitness(witness: string) {
    if (witness === caseKey.witness) {
      patch({ selectedWitness: witness, step: "evidence", feedback: "", currentHint: 0 })
      return
    }
    patch({
      selectedWitness: witness,
      step: "suspect-feedback",
      feedback: config.neutralResponse,
      failedAttempts: state.failedAttempts + 1,
      currentHint: 0,
    })
  }

  function submitEvidence() {
    if (!state.selectedQuoteId || !state.selectedDocumentId || state.why.trim().length < 15) return
    const quote = config.quotes.find((item) => item.id === state.selectedQuoteId)
    const document = config.documents.find((item) => item.id === state.selectedDocumentId)
    if (!quote || !document) return

    const isCorrectQuote = state.selectedQuoteId === caseKey.correctQuoteId
    const isCorrectDocument = state.selectedDocumentId === caseKey.correctDocumentId
    const success = isCorrectQuote && isCorrectDocument
    const autoHint = isCorrectQuote && !isCorrectDocument
    const failedAttempts = success ? state.failedAttempts : state.failedAttempts + 1
    const maxHintLevel = autoHint ? 3 : state.maxHintLevel
    const hintsUsed = autoHint ? state.hintsUsed + (state.maxHintLevel < 3 ? 1 : 0) : state.hintsUsed
    const feedback = success
      ? config.success
      : autoHint
        ? config.hints[3]
        : !isCorrectQuote && isCorrectDocument
          ? config.documentMismatch
          : "Пара не підтверджує суперечність. Спробуйте зіставити іншу цитату й документ."

    const recordId = upsertContradiction({
      witness: caseKey.witness,
      quoteId: quote.id,
      quote: quote.text,
      documentId: document.id,
      document: document.title,
      why: state.why.trim(),
      failedAttempts,
      hintsUsed,
      maxHintLevel,
      status: success ? "розв'язано" : "pending",
    })

    if (success) {
      if (state.savedRecordId && state.savedRecordId !== recordId) {
        updateContradiction(state.savedRecordId, { failedAttempts, hintsUsed, maxHintLevel })
      }
      patch({
        step: "success",
        feedback,
        failedAttempts,
        hintsUsed,
        maxHintLevel,
        savedRecordId: recordId,
      })
      return
    }

    patch({
      step: "evidence",
      feedback,
      failedAttempts,
      hintsUsed,
      maxHintLevel,
      currentHint: autoHint ? 3 : 0,
      savedRecordId: recordId,
    })
  }

  function closeBlock() {
    patch({ isOpen: false })
  }

  function reopenBlock() {
    patch({ isOpen: true })
  }

  const hintAvailable = state.maxHintLevel < 3
  const selectedQuote = config.quotes.find((item) => item.id === state.selectedQuoteId)

  return (
    <section className="witness-cross-check" aria-label="Окреме доручення від помічника">
      <div className="witness-cross-check__heading">
        <div>
          <span>ОКРЕМЕ ДОРУЧЕННЯ ВІД ПОМІЧНИКА</span>
          <h2>Перехресна перевірка показань</h2>
        </div>
        {!state.isOpen && (
          <button type="button" className="witness-cross-check__reopen" onClick={reopenBlock}>
            Відкрити доручення
          </button>
        )}
      </div>

      {state.isOpen && (
        <div className="witness-cross-check__panel">
          <div className="witness-cross-check__assistant">
            <img src="/assistant-mark.png" alt="" aria-hidden="true" />
            <div>
              <span>ПОМІЧНИК АНДРІЙ</span>
              {state.step === "intro" && <p>{config.softHint}</p>}
              {state.step === "suspect" && <p>Хто з допитаних, на вашу думку, говорить неправду або щось замовчує?</p>}
              {state.step === "suspect-feedback" && <p>{state.feedback}</p>}
              {state.step === "evidence" && <p>Оберіть цитату зі свідчень і документ, який її спростовує.</p>}
              {state.step === "success" && <p>{config.success}</p>}
            </div>
          </div>

          {state.step === "intro" && (
            <div className="witness-cross-check__actions">
              <button type="button" className="witness-cross-check__secondary" onClick={closeBlock}>Перечитаю</button>
              <button type="button" className="witness-cross-check__primary" onClick={() => patch({ step: "suspect" })}>Я вже знаю, хто</button>
            </div>
          )}

          {state.step === "suspect" && (
            <div className="witness-cross-check__options" role="group" aria-label="Вибір свідка">
              {state.witnessOrder.map((witness) => (
                <button key={witness} type="button" onClick={() => chooseWitness(witness)}>{witness}</button>
              ))}
            </div>
          )}

          {state.step === "suspect-feedback" && (
            <div className="witness-cross-check__actions">
              <button type="button" className="witness-cross-check__primary" onClick={() => patch({ step: "suspect", selectedWitness: "" })}>Спробувати ще раз</button>
            </div>
          )}

          {state.step === "evidence" && (
            <div className="witness-cross-check__evidence">
              <label>
                <span>ЦИТАТА ЗІ СВІДЧЕНЬ</span>
                <select value={state.selectedQuoteId} onChange={(event) => patch({ selectedQuoteId: event.target.value })}>
                  <option value="">Оберіть цитату</option>
                  {state.quoteOrder.map((id) => {
                    const quote = config.quotes.find((item) => item.id === id)
                    return quote ? <option key={quote.id} value={quote.id}>{quote.text}</option> : null
                  })}
                </select>
              </label>
              <label>
                <span>ДОКУМЕНТ</span>
                <select value={state.selectedDocumentId} onChange={(event) => patch({ selectedDocumentId: event.target.value })}>
                  <option value="">Оберіть документ</option>
                  {config.documents.map((document) => <option key={document.id} value={document.id}>{document.title}</option>)}
                </select>
              </label>
              <label>
                <span>ЧОМУ ВИ ТАК ВВАЖАЄТЕ? (МІНІМУМ 15 СИМВОЛІВ)</span>
                <textarea value={state.why} onChange={(event) => patch({ why: event.target.value })} minLength={15} rows={3} placeholder="Ваше пояснення для ведучого…" />
              </label>
              <button type="button" className="witness-cross-check__primary"
                disabled={!state.selectedQuoteId || !state.selectedDocumentId || state.why.trim().length < 15}
                onClick={submitEvidence}>Перевірити пару</button>
              {state.feedback && <p className="witness-cross-check__feedback">{state.feedback}</p>}
              {state.currentHint > 0 && <p className="witness-cross-check__hint">ПІДКАЗКА {state.currentHint}: {config.hints[state.currentHint as 1 | 2 | 3]}</p>}
            </div>
          )}

          {state.step === "success" && (
            <div className="witness-cross-check__success">
              <p>{config.successFooter}</p>
              <span>Зверніться до ведучого за наступним матеріалом.</span>
            </div>
          )}

          {state.step !== "success" && (
            <div className="witness-cross-check__footer">
              {hintAvailable && state.step !== "intro" && (
                <button type="button" onClick={requestHint}>Попросити підказку</button>
              )}
              {!hintAvailable && <span>Усі рівні підказок використано.</span>}
              {state.step !== "intro" && <small>Невдалих спроб: {state.failedAttempts} · Підказок: {state.hintsUsed}</small>}
              <button type="button" className="witness-cross-check__close" onClick={closeBlock}>Згорнути доручення</button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
