import { useEffect, useRef, useState } from "react"
import vehicles from "../../baza_danych_avto.json"
import {
  useInvestigatorNotebook,
  type InvestigationNote,
  type NotebookStatus,
} from "../../components/InvestigatorNotebook/InvestigatorNotebookContext"
import { CASE_KEY_VEHICLES, isCaseKeyPlate } from "../../config/caseKey"
import {
  getAssistantText,
  getRejectedText,
  getSummaryText,
  type AssistantAction,
} from "../../config/assistantTexts"
import "./AssistantReview.css"

const REVIEW_STORAGE_KEY = "detective-assistant-review-v1"

type ReviewEvaluation = {
  noteId: string
  plate: string
  ownerName: string
  action: AssistantAction
  ownerType: string
  status: "approved" | "rejected"
  text: string
  variant: number
}

type ReviewGroupMessage = {
  key: string
  action: AssistantAction
  ownerType: string
  names: string[]
  text: string
  variant: number
}

type ReviewState = {
  evaluations: ReviewEvaluation[]
  rejectedGroups: ReviewGroupMessage[]
  summary: {
    completed: boolean
    text: string
    variant: number
  }
  stageFiveUnlocked: boolean
}

type Vehicle = (typeof vehicles)[number]

type AssistantReviewProps = {
  onBack: () => void
  onStage5Start: () => void
}

function readReviewState(): ReviewState | null {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    return parsed as ReviewState
  } catch {
    return null
  }
}

function saveReviewState(state: ReviewState) {
  try {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Локальне сховище може бути недоступним у приватному режимі.
  }
}

function normalizePlate(value: string) {
  return value.replace(/\s+/g, " ").trim().toLocaleUpperCase("uk-UA")
}

function getVehicleByPlate(plate: string): Vehicle | undefined {
  const normalized = normalizePlate(plate)
  return (vehicles as Vehicle[]).find(
    (vehicle) => normalizePlate(vehicle.plate) === normalized,
  )
}

function isStructuredVehicleAction(note: InvestigationNote): note is InvestigationNote & {
  plate: string
  ownerName: string
  action: AssistantAction
} {
  return (
    note.status === "pending" &&
    Boolean(note.plate) &&
    Boolean(note.ownerName) &&
    (note.action === "interrogate" || note.action === "suspicion")
  )
}

function chooseVariant(length: number) {
  return length > 1 ? Math.floor(Math.random() * length) : 0
}

function buildEvaluation(note: InvestigationNote): ReviewEvaluation {
  const plate = normalizePlate(note.plate ?? "")
  const ownerName = note.ownerName ?? ""
  const action = note.action as AssistantAction

  if (isCaseKeyPlate(plate)) {
    const variants = action === "interrogate"
      ? getAssistantTextVariants(plate, action)
      : getAssistantTextVariants(plate, action)
    const variant = chooseVariant(variants.length)

    return {
      noteId: note.id,
      plate,
      ownerName,
      action,
      ownerType: getVehicleByPlate(plate)?.ownerType ?? "",
      status: "approved",
      text: getAssistantText(plate, action, variant),
      variant,
    }
  }

  const ownerType = getVehicleByPlate(plate)?.ownerType ?? ""
  const variant = chooseRejectedVariant(ownerType, action)

  return {
    noteId: note.id,
    plate,
    ownerName,
    action,
    ownerType,
    status: "rejected",
    text: "",
    variant,
  }
}

function getAssistantTextVariants(plate: string, action: AssistantAction) {
  if (action === "interrogate") {
    return [
      getAssistantText(plate, action, 0),
    ].filter(Boolean)
  }

  return [0, 1].map((variant) => getAssistantText(plate, action, variant)).filter(Boolean)
}

function chooseRejectedVariant(ownerType: string, action: AssistantAction) {
  // У поточному конфігу кожен тип дії має один текстовий варіант.
  return 0
}

function groupRejectedEvaluations(evaluations: ReviewEvaluation[]): ReviewGroupMessage[] {
  const groups = new Map<string, ReviewEvaluation[]>()

  evaluations
    .filter((evaluation) => evaluation.status === "rejected")
    .forEach((evaluation) => {
      const key = `${evaluation.ownerType === "ЮР" ? "legal" : "physical"}::${evaluation.action}`
      const current = groups.get(key) ?? []
      groups.set(key, [...current, evaluation])
    })

  return Array.from(groups.entries()).map(([key, group]) => {
    const action = group[0].action
    const ownerType = group[0].ownerType
    const names = group.map((evaluation) => evaluation.ownerName)
    const variant = group[0].variant

    return {
      key,
      action,
      ownerType,
      names,
      text: getRejectedText(ownerType, action, names.join(", "), variant),
      variant,
    }
  })
}

function hasApprovedCaseKeyVehicle(notes: InvestigationNote[], plate: string) {
  return notes.some(
    (note) =>
      note.status === "approved" &&
      note.plate &&
      normalizePlate(note.plate) === normalizePlate(plate) &&
      (note.action === "interrogate" || note.action === "suspicion"),
  )
}

function hasCompletedCaseKey(notes: InvestigationNote[]) {
  return CASE_KEY_VEHICLES.every((vehicle) => hasApprovedCaseKeyVehicle(notes, vehicle.plate))
}

function getReviewStatusLabel(status: ReviewEvaluation["status"]) {
  return status === "approved" ? "погоджено" : "відхилено"
}

export default function AssistantReview({ onBack, onStage5Start }: AssistantReviewProps) {
  const { notes, updateNote } = useInvestigatorNotebook()
  const processedRef = useRef(false)
  const [reviewState, setReviewState] = useState<ReviewState | null>(() => readReviewState())

  useEffect(() => {
    const saved = readReviewState()

    if (saved?.stageFiveUnlocked) {
      onStage5Start()
      return
    }

    if (processedRef.current) return

    const pending = notes.filter(isStructuredVehicleAction)

    if (pending.length === 0) {
      if (saved) {
        setReviewState(saved)
      } else {
        onBack()
      }
      return
    }

    processedRef.current = true

    const evaluations = pending.map(buildEvaluation)
    const rejectedGroups = groupRejectedEvaluations(evaluations)
    const completed = hasCompletedCaseKey(
      notes.map((note) => {
        const evaluation = evaluations.find((item) => item.noteId === note.id)
        return evaluation ? { ...note, status: evaluation.status } : note
      }),
    )
    const summaryVariant = 0

    evaluations.forEach((evaluation) => {
      updateNote(evaluation.noteId, {
        status: evaluation.status as NotebookStatus,
      })
    })

    const nextState: ReviewState = {
      evaluations,
      rejectedGroups,
      summary: {
        completed,
        text: getSummaryText(completed, summaryVariant),
        variant: summaryVariant,
      },
      stageFiveUnlocked: false,
    }

    saveReviewState(nextState)
    setReviewState(nextState)
  }, [notes, onBack, onStage5Start, updateNote])

  function handleStageFiveStart() {
    if (!reviewState?.summary.completed) return

    const nextState = {
      ...reviewState,
      stageFiveUnlocked: true,
    }
    saveReviewState(nextState)
    setReviewState(nextState)
    onStage5Start()
  }

  if (!reviewState) {
    return (
      <main className="assistant-review assistant-review--loading" aria-label="Помічник">
        <div className="assistant-review__loading">Помічник перевіряє матеріали…</div>
      </main>
    )
  }

  return (
    <main className="assistant-review" aria-label="Оцінка дій слідчого">
      <header className="assistant-review__topline">
        <span><i /> ПОВІДОМЛЕННЯ ВІД ПОМІЧНИКА</span>
        <span>ЕТАП 04 · ОЦІНКА ДІЙ</span>
      </header>

      <div className="assistant-review__wrap">
        <div className="assistant-review__kicker">
          <span>НАПАРНИК · АНДРІЙ</span>
          <span>ПЕРЕВІРКА РЕЗУЛЬТАТІВ</span>
        </div>

        <section className="assistant-review__hero">
          <img className="assistant-review__avatar" src="/assistant-mark.png" alt="" aria-hidden="true" />
          <div>
            <span className="assistant-review__eyebrow">ПОМІЧНИК АНДРІЙ</span>
            <small>ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ</small>
            <h1>Капітане, розберімо результати</h1>
            <p>
              Я перевірив дії, які ти зафіксував у блокноті. Нижче — результат
              опрацювання кожної дії, яку було подано на перевірку.
            </p>
          </div>
        </section>

        <section className="assistant-review__results" aria-label="Результати оцінки">
          <div className="assistant-review__section-heading">
            <div>
              <span>ОПРАЦЮВАННЯ ЗАПИСІВ</span>
              <h2>Результати перевірки</h2>
            </div>
            <span>{reviewState.evaluations.length} ЗАПИСІВ</span>
          </div>

          <div className="assistant-review__list">
            {reviewState.evaluations.map((evaluation) => (
              <article className="assistant-review__item" key={evaluation.noteId}>
                <div className="assistant-review__item-status">
                  <span className={`assistant-review__badge assistant-review__badge--${evaluation.status}`}>
                    <i /> {getReviewStatusLabel(evaluation.status)}
                  </span>
                  <span className="assistant-review__action">
                    {evaluation.action === "interrogate" ? "ДОПИТ" : "КЛОПОТАННЯ ПРО ПІДОЗРУ"}
                  </span>
                </div>
                <div className="assistant-review__item-main">
                  <div>
                    <span className="assistant-review__plate">{evaluation.plate}</span>
                    <h3>{evaluation.ownerName}</h3>
                  </div>
                  {evaluation.status === "approved" && (
                    <p>{evaluation.text}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {reviewState.rejectedGroups.length > 0 && (
          <section className="assistant-review__rejected" aria-label="Повідомлення щодо відхилених дій">
            <div className="assistant-review__section-heading">
              <div>
                <span>РІШЕННЯ ЩОДО ВІДХИЛЕНИХ ДІЙ</span>
                <h2>Висновок перевірки</h2>
              </div>
              <span>{reviewState.rejectedGroups.length} ПОВІДОМЛЕНЬ</span>
            </div>

            <div className="assistant-review__messages">
              {reviewState.rejectedGroups.map((group) => (
                <div className="assistant-review__message" key={group.key}>
                  <span>ПОМИЧНИК АНДРІЙ</span>
                  <p>{group.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={`assistant-review__summary ${reviewState.summary.completed ? "is-complete" : "is-incomplete"}`}>
          <span className="assistant-review__summary-label">
            {reviewState.summary.completed ? "ЕТАП ОПРАЦЮВАНО" : "РОЗСЛІДУВАННЯ ТРИВАЄ"}
          </span>
          <p>{reviewState.summary.text}</p>

          <div className="assistant-review__actions">
            {reviewState.summary.completed ? (
              <button
                type="button"
                className="assistant-review__next"
                onClick={handleStageFiveStart}
              >
                Перейти до 5 конверту →
              </button>
            ) : (
              <button type="button" className="stage-one-secondary" onClick={onBack}>
                ← Повернутися до бази даних
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
