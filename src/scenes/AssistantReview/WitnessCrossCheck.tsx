import { useEffect, useRef, useState } from "react"
import { useInvestigatorNotebook } from "../../components/InvestigatorNotebook/InvestigatorNotebookContext"
import { useAudioManager } from "../../audio/AudioManagerContext"
import { WITNESS_CROSS_CHECK_CONFIG as config } from "../../config/witnessCrossCheck"
import { WITNESS_CROSS_CHECK_CASE_KEY as caseKey } from "../../config/witnessCrossCheckCaseKey"
import "./WitnessCrossCheck.css"

type Step = "intro" | "suspect" | "suspect-feedback" | "evidence" | "success"

type CrossCheckState = {
  isOpen: boolean
  step: Step
  introPlayed: boolean
  witnessOrder: string[]
  quoteOrder: string[]
  selectedWitness: string
  selectedQuoteId: string
  selectedDocumentId: string
  failedAttempts: number
  hintsUsed: number
  maxHintLevel: number
  currentHint: number
  feedback: string
  feedbackAudio: string
  savedRecordId: string | null
  failureOrderA: string[]
  failureIndexA: number
  failureOrderB: string[]
  failureIndexB: number
  isSolved: boolean
}

type Props = {
  onBack: () => void
  onSuccess: () => void
}

const STORAGE_KEY = "detective-witness-cross-check-state-v1"

function shuffle<T>(values: readonly T[]) {
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
    introPlayed: false,
    witnessOrder: shuffle(config.witnesses),
    quoteOrder: shuffle(config.quotes.map((quote) => quote.id)),
    selectedWitness: "",
    selectedQuoteId: "",
    selectedDocumentId: "",
    failedAttempts: 0,
    hintsUsed: 0,
    maxHintLevel: 0,
    currentHint: 0,
    feedback: "",
    feedbackAudio: "",
    savedRecordId: null,
    failureOrderA: shuffle(config.failureAudioA.map((item) => item.id)),
    failureIndexA: 0,
    failureOrderB: shuffle(config.failureAudioB.map((item) => item.id)),
    failureIndexB: 0,
    isSolved: false,
  }
}

function readState() {
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
      failureOrderA: Array.isArray(saved.failureOrderA) ? saved.failureOrderA : fallback.failureOrderA,
      failureOrderB: Array.isArray(saved.failureOrderB) ? saved.failureOrderB : fallback.failureOrderB,
    }
  } catch {
    return createInitialState()
  }
}

function saveState(state: CrossCheckState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Інтерфейс продовжує працювати без localStorage.
  }
}

function getAutomaticHintLevel(failedAttempts: number, hintsUsed: number) {
  return Math.min(3, failedAttempts + hintsUsed)
}

function poolText(pool: "A" | "B", id: string) {
  const item = (pool === "A" ? config.failureAudioA : config.failureAudioB).find((entry) => entry.id === id)
  return item?.text ?? config.neutralResponse
}

export default function WitnessCrossCheck({ onBack, onSuccess }: Props) {
  const { upsertContradiction } = useInvestigatorNotebook()
  const { playVoice, stopVoice } = useAudioManager()
  const [state, setState] = useState<CrossCheckState>(() => ({ ...readState(), isOpen: true }))
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const successCallbackRef = useRef(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    if (state.isSolved || state.step === "success") return

    if (state.introPlayed) {
      if (state.step === "intro") {
        setState((current) => ({ ...current, step: "suspect", feedbackAudio: "" }))
      }
      return
    }

    patch({
      introPlayed: true,
      feedbackAudio: config.audio.intro,
    })

    void playVoice({
      src: config.audio.intro,
      onStart: () => setIsAudioPlaying(true),
      onEnded: () => {
        setIsAudioPlaying(false)
        setState((current) => current.step === "intro" ? { ...current, step: "suspect", feedbackAudio: "" } : current)
      },
    }).then((started) => {
      if (!started) {
        setIsAudioPlaying(false)
        setState((current) => current.step === "intro" ? { ...current, step: "suspect", feedbackAudio: "" } : current)
      }
    })

    return () => {
      stopVoice()
      setIsAudioPlaying(false)
    }
  }, [])

  function patch(next: Partial<CrossCheckState>) {
    setState((current) => ({ ...current, ...next }))
  }

  function chooseNextAudio(pool: "A" | "B") {
    const order = pool === "A" ? state.failureOrderA : state.failureOrderB
    const index = pool === "A" ? state.failureIndexA : state.failureIndexB
    const source = pool === "A" ? config.failureAudioA : config.failureAudioB

    if (order.length === 0) {
      const freshOrder = shuffle(source.map((item) => item.id))
      return { id: freshOrder[0], order: freshOrder, index: 1 }
    }

    if (index >= order.length) {
      const freshOrder = shuffle(source.map((item) => item.id))
      return { id: freshOrder[0], order: freshOrder, index: 1 }
    }

    return { id: order[index], order, index: index + 1 }
  }

  async function playFeedbackAudio(audioPath: string, after?: () => void) {
    patch({ feedbackAudio: audioPath })
    setIsAudioPlaying(true)

    const started = await playVoice({
      src: audioPath,
      onStart: () => setIsAudioPlaying(true),
      onEnded: () => {
        setIsAudioPlaying(false)
        after?.()
      },
    })

    if (!started) {
      setIsAudioPlaying(false)
      after?.()
    }
  }

  function chooseWitness(witness: string) {
    if (isAudioPlaying) return

    if (witness === caseKey.witness) {
      patch({ selectedWitness: witness, step: "evidence", feedback: "", currentHint: 0 })
      return
    }

    const failedAttempts = state.failedAttempts + 1
    const hintLevel = getAutomaticHintLevel(failedAttempts, state.hintsUsed)
    const pool = chooseNextAudio("A")

    const nextState = {
      selectedWitness: witness,
      step: "suspect-feedback" as const,
      feedback: poolText("A", pool.id),
      failedAttempts,
      currentHint: hintLevel,
      maxHintLevel: Math.max(state.maxHintLevel, hintLevel),
      feedbackAudio: pool.id,
      failureOrderA: pool.order,
      failureIndexA: pool.index,
    }

    patch(nextState)
    void playFeedbackAudio(pool.id)
  }

  async function requestHint() {
    if (isAudioPlaying || state.maxHintLevel >= 3) return
    const level = Math.min(3, Math.max(1, state.failedAttempts + state.hintsUsed + 1))
    const nextHintsUsed = state.hintsUsed + 1
    patch({
      hintsUsed: nextHintsUsed,
      maxHintLevel: Math.max(state.maxHintLevel, level),
      currentHint: level,
    })
    await playFeedbackAudio(config.audioHints[level as 1 | 2 | 3])
  }

  async function submitEvidence() {
    if (isAudioPlaying || !state.selectedQuoteId || !state.selectedDocumentId) return

    const quote = config.quotes.find((item) => item.id === state.selectedQuoteId)
    const document = config.documents.find((item) => item.id === state.selectedDocumentId)
    if (!quote || !document) return

    const isCorrectQuote = state.selectedQuoteId === caseKey.correctQuoteId
    const isCorrectDocument = state.selectedDocumentId === caseKey.correctDocumentId
    const success = isCorrectQuote && isCorrectDocument

    if (success) {
      const recordId = upsertContradiction({
        witness: caseKey.witness,
        quoteId: quote.id,
        quote: quote.text,
        documentId: document.id,
        document: document.title,
        failedAttempts: state.failedAttempts,
        hintsUsed: state.hintsUsed,
        maxHintLevel: state.maxHintLevel,
        status: "розв'язано",
      })

      patch({
        step: "success",
        isSolved: true,
        isOpen: true,
        feedback: config.success,
        feedbackAudio: config.audio.success,
        savedRecordId: recordId,
        currentHint: 0,
      })

      await playFeedbackAudio(config.audio.success, () => setIsAudioPlaying(false))
      return
    }

    const failedAttempts = state.failedAttempts + 1
    const autoHint = isCorrectQuote && !isCorrectDocument
    const hintLevel = autoHint ? 3 : getAutomaticHintLevel(failedAttempts, state.hintsUsed)
    const nextHintsUsed = autoHint ? Math.max(state.hintsUsed, 1) : state.hintsUsed
    const pool = chooseNextAudio(!isCorrectQuote && isCorrectDocument ? "B" : "A")

    const recordId = upsertContradiction({
      witness: caseKey.witness,
      quoteId: quote.id,
      quote: quote.text,
      documentId: document.id,
      document: document.title,
      failedAttempts,
      hintsUsed: nextHintsUsed,
      maxHintLevel: Math.max(state.maxHintLevel, hintLevel),
      status: "pending",
    })

    patch({
      step: "evidence",
      feedback: poolText(!isCorrectQuote && isCorrectDocument ? "B" : "A", pool.id),
      failedAttempts,
      hintsUsed: nextHintsUsed,
      maxHintLevel: Math.max(state.maxHintLevel, hintLevel),
      currentHint: hintLevel,
      savedRecordId: recordId,
      feedbackAudio: pool.id,
      ...( !isCorrectQuote && isCorrectDocument ? {
        failureOrderB: pool.order,
        failureIndexB: pool.index,
      } : {
        failureOrderA: pool.order,
        failureIndexA: pool.index,
      }),
    })

    void playFeedbackAudio(pool.id, async () => {
      if (hintLevel > 0) {
        await playFeedbackAudio(config.audioHints[hintLevel as 1 | 2 | 3])
      }
    })
  }

  function closeWindow() {
    stopVoice()
    setIsAudioPlaying(false)
    patch({ isOpen: false })
    onBack()
  }

  const selectedQuote = useMemo(
    () => config.quotes.find((quote) => quote.id === state.selectedQuoteId),
    [state.selectedQuoteId],
  )

  if (!state.isOpen) {
    onBack()
    return null
  }

  return (
    <main className="witness-cross-check" aria-label="Перехресна перевірка показань">
      <div className="witness-cross-check__backdrop" aria-hidden="true" />
      <div className="witness-cross-check__window">
        <header className="witness-cross-check__topline">
          <span><i /> ОКРЕМЕ ДОРУЧЕННЯ</span>
          <span>ЕТАП 04 · ПЕРЕХРЕСНА ПЕРЕВІРКА</span>
        </header>

        <div className="witness-cross-check__content">
          <div className="witness-cross-check__heading">
            <div>
              <span>ПОМИЧНИК АНДРІЙ</span>
              <h1>Перехресна перевірка показань</h1>
            </div>
            <button type="button" onClick={closeWindow} disabled={isAudioPlaying}>×</button>
          </div>

          {state.step === "intro" && (
            <section className="witness-cross-check__dialogue witness-cross-check__dialogue--intro">
              <img src="/assistant-mark.png" alt="" aria-hidden="true" />
              <p>{config.introText}</p>
            </section>
          )}

          {state.step === "suspect" && (
            <section className="witness-cross-check__step">
              <span className="witness-cross-check__step-label">КРОК 2</span>
              <h2>Хто з допитаних, на вашу думку, говорить неправду або щось замовчує?</h2>
              <div className="witness-cross-check__options">
                {state.witnessOrder.map((witness) => (
                  <button key={witness} type="button" disabled={isAudioPlaying} onClick={() => chooseWitness(witness)}>
                    {witness}
                  </button>
                ))}
              </div>
            </section>
          )}

          {state.step === "suspect-feedback" && (
            <section className="witness-cross-check__feedback-screen">
              <img src="/assistant-mark.png" alt="" aria-hidden="true" />
              <p>{state.feedback}</p>
              <button type="button" className="witness-cross-check__primary" disabled={isAudioPlaying} onClick={() => patch({ step: "suspect", selectedWitness: "", currentHint: 0 })}>
                Спробувати ще раз
              </button>
            </section>
          )}

          {state.step === "evidence" && (
            <section className="witness-cross-check__step">
              <span className="witness-cross-check__step-label">КРОК 3</span>
              <h2>Оберіть цитату зі свідчень і документ, який її спростовує.</h2>

              <div className="witness-cross-check__evidence">
                <label>
                  <span>ЦИТАТА ЗІ СВІДЧЕНЬ</span>
                  <select value={state.selectedQuoteId} disabled={isAudioPlaying} onChange={(event) => patch({ selectedQuoteId: event.target.value, feedback: "" })}>
                    <option value="">Оберіть цитату</option>
                    {state.quoteOrder.map((id) => {
                      const quote = config.quotes.find((item) => item.id === id)
                      return quote ? <option key={quote.id} value={quote.id}>{quote.text}</option> : null
                    })}
                  </select>
                </label>

                <label>
                  <span>ДОКУМЕНТ</span>
                  <select value={state.selectedDocumentId} disabled={isAudioPlaying} onChange={(event) => patch({ selectedDocumentId: event.target.value, feedback: "" })}>
                    <option value="">Оберіть документ</option>
                    {config.documents.map((document) => (
                      <option key={document.id} value={document.id}>{document.title}</option>
                    ))}
                  </select>
                </label>

                <button type="button" className="witness-cross-check__primary" disabled={isAudioPlaying || !state.selectedQuoteId || !state.selectedDocumentId} onClick={() => void submitEvidence()}>
                  Перевірити пару
                </button>
              </div>

              {state.feedback && <p className="witness-cross-check__feedback-text">{state.feedback}</p>}
            </section>
          )}

          {state.currentHint > 0 && state.step !== "success" && (
            <div className="witness-cross-check__hint">
              <span>ПІДКАЗКА {state.currentHint}</span>
              <p>{config.hints[state.currentHint as 1 | 2 | 3]}</p>
            </div>
          )}

          {state.step === "success" && (
            <section className="witness-cross-check__success">
              <img src="/assistant-mark.png" alt="" aria-hidden="true" />
              <p>{config.successText}</p>
              {!isAudioPlaying && (
                <button type="button" className="witness-cross-check__primary" onClick={() => {
                  if (successCallbackRef.current) return
                  successCallbackRef.current = true
                  onSuccess()
                }}>
                  Перейти до 5 конверту →
                </button>
              )}
            </section>
          )}

          {state.step !== "success" && (
            <footer className="witness-cross-check__footer">
              <div>
                {state.maxHintLevel < 3 ? (
                  <button type="button" onClick={() => void requestHint()} disabled={isAudioPlaying}>Попросити підказку</button>
                ) : (
                  <span>Усі рівні підказок використано.</span>
                )}
                <small>Невдалих спроб: {state.failedAttempts} · Підказок: {state.hintsUsed}</small>
              </div>
              <button type="button" className="witness-cross-check__close-link" onClick={closeWindow} disabled={isAudioPlaying}>
                Повернутися до зауважень
              </button>
            </footer>
          )}
        </div>
      </div>
    </main>
  )
}
