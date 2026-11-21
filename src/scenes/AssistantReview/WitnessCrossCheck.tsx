import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { createPortal } from "react-dom"
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
  documentOrder: string[]
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

type EvidenceOption = {
  id: string
  label: string
  kind?: string
  date?: string
}

type EvidencePickerProps = {
  id: string
  label: string
  placeholder: string
  value: string
  options: EvidenceOption[]
  disabled?: boolean
  variant: "quote" | "document"
  onChange: (value: string) => void
}

function getUkrainianDocumentCount(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  const word = mod10 === 1 && mod100 !== 11
    ? "документ"
    : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
      ? "документи"
      : "документів"
  return count + " " + word
}

function EvidencePicker({
  id,
  label,
  placeholder,
  value,
  options,
  disabled = false,
  variant,
  onChange,
}: EvidencePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [search, setSearch] = useState("")
  const [activeKind, setActiveKind] = useState("Усі")
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const hasNavigatedRef = useRef(false)
  const selected = options.find((option) => option.id === value)
  const isDocument = variant === "document"

  const kinds = useMemo(
    () => ["Усі", ...Array.from(new Set(options.map((option) => option.kind).filter((kind): kind is string => Boolean(kind))))],
    [options],
  )

  const visibleOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("uk-UA")
    return options.filter((option) => {
      const matchesKind = !isDocument || activeKind === "Усі" || option.kind === activeKind
      const matchesSearch = !isDocument || !normalizedSearch ||
        (option.label + " " + (option.kind || "")).toLocaleLowerCase("uk-UA").includes(normalizedSearch)
      return matchesKind && matchesSearch
    })
  }, [activeKind, isDocument, options, search])

  function closePicker(restoreFocus = true) {
    setIsOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  function chooseOption(option: EvidenceOption) {
    onChange(option.id)
    closePicker(true)
  }

  function moveActive(nextIndex: number) {
    if (!visibleOptions.length) return
    hasNavigatedRef.current = true
    const boundedIndex = Math.max(0, Math.min(visibleOptions.length - 1, nextIndex))
    setActiveIndex(boundedIndex)
    const activeOption = visibleOptions[boundedIndex]
    if (activeOption) {
      window.requestAnimationFrame(() => {
        document.getElementById(id + "-option-" + activeOption.id)?.scrollIntoView({ block: "nearest" })
      })
    }
  }

  function openPicker() {
    if (disabled) return
    hasNavigatedRef.current = false
    const selectedIndex = visibleOptions.findIndex((option) => option.id === value)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setIsOpen(true)
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (!isOpen) {
        openPicker()
      } else {
        moveActive(activeIndex + (event.key === "ArrowDown" ? 1 : -1))
      }
      return
    }
    if (event.key === "Home" || event.key === "End") {
      if (!isOpen) return
      event.preventDefault()
      moveActive(event.key === "Home" ? 0 : visibleOptions.length - 1)
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (!isOpen) openPicker()
      else if (visibleOptions[activeIndex]) chooseOption(visibleOptions[activeIndex])
    }
    if (event.key === "Escape" && isOpen) {
      event.preventDefault()
      closePicker(true)
    }
  }

  function handlePanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      closePicker(true)
      return
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      moveActive(activeIndex + (event.key === "ArrowDown" ? 1 : -1))
      return
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      moveActive(event.key === "Home" ? 0 : visibleOptions.length - 1)
      return
    }
    if (event.key === "Enter") {
      const target = event.target
      const isSearch = target instanceof HTMLInputElement
      const isFilter = target instanceof HTMLButtonElement && target.classList.contains("witness-picker__filter")
      const isClose = target === closeRef.current
      if (!isSearch && !isFilter && (!isClose || hasNavigatedRef.current)) {
        event.preventDefault()
        if (visibleOptions[activeIndex]) chooseOption(visibleOptions[activeIndex])
        return
      }
    }
    if (event.key === "Tab" && window.matchMedia("(max-width: 720px)").matches) {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('[data-picker-focusable="true"]')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  useLayoutEffect(() => {
    if (!isOpen) return

    const html = document.documentElement
    const body = document.body
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow
    const scrollPosition = window.scrollY

    html.style.overflow = "hidden"
    body.style.overflow = "hidden"

    const updatePanelPosition = () => {
      if (window.matchMedia("(max-width: 720px)").matches) {
        setPanelStyle({})
        return
      }

      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      const viewportPadding = 16
      const spaceBelow = Math.max(120, window.innerHeight - rect.bottom - viewportPadding)
      const spaceAbove = Math.max(120, rect.top - viewportPadding)
      const openAbove = spaceBelow < 300 && spaceAbove > spaceBelow
      const availableHeight = Math.min(520, openAbove ? spaceAbove : spaceBelow)
      const panelWidth = Math.min(rect.width, window.innerWidth - viewportPadding * 2)
      const panelLeft = Math.max(
        viewportPadding,
        Math.min(rect.left, window.innerWidth - panelWidth - viewportPadding),
      )

      setPanelStyle({
        position: "fixed",
        top: openAbove
          ? Math.max(viewportPadding, rect.top - availableHeight - 8) + "px"
          : rect.bottom + 8 + "px",
        left: panelLeft + "px",
        width: panelWidth + "px",
        maxHeight: availableHeight + "px",
      })
    }

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePicker(true)
    }

    updatePanelPosition()
    window.addEventListener("resize", updatePanelPosition)
    window.addEventListener("scroll", updatePanelPosition, true)
    document.addEventListener("keydown", handleGlobalKeyDown)

    if (window.matchMedia("(max-width: 720px)").matches) {
      window.requestAnimationFrame(() => closeRef.current?.focus())
    }

    return () => {
      window.removeEventListener("resize", updatePanelPosition)
      window.removeEventListener("scroll", updatePanelPosition, true)
      document.removeEventListener("keydown", handleGlobalKeyDown)
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
      window.scrollTo(0, scrollPosition)
    }
  }, [isOpen])

  useEffect(() => {
    if (activeIndex >= visibleOptions.length) {
      setActiveIndex(Math.max(0, visibleOptions.length - 1))
      return
    }
    if (!isOpen) return
    const activeOption = visibleOptions[activeIndex]
    if (activeOption) {
      window.requestAnimationFrame(() => {
        document.getElementById(id + "-option-" + activeOption.id)?.scrollIntoView({ block: "nearest" })
      })
    }
  }, [activeIndex, id, isOpen, visibleOptions])

  const activeOption = visibleOptions[activeIndex]
  const panel = isOpen ? createPortal(
    <>
      <button
        type="button"
        className="witness-picker__scrim"
        aria-label="Закрити список"
        onClick={() => closePicker(true)}
      />
      <div
        ref={panelRef}
        className={"witness-picker__panel" + (isDocument ? " witness-picker__panel--documents" : " witness-picker__panel--quotes")}
        style={panelStyle}
        onKeyDown={handlePanelKeyDown}
      >
        <div className="witness-picker__handle" aria-hidden="true" />
        <div className="witness-picker__panel-heading">
          <div>
            <span>МАТЕРІАЛИ СПРАВИ</span>
            <strong>{label}</strong>
          </div>
          <button
            ref={closeRef}
            type="button"
            data-picker-focusable="true"
            className="witness-picker__close"
            onClick={() => closePicker(true)}
          >
            Закрити
          </button>
        </div>

        {isDocument && (
          <div className="witness-picker__tools">
            <input
              type="search"
              className="witness-picker__search"
              value={search}
              placeholder="Пошук за назвою або типом…"
              aria-label="Пошук документів"
              data-picker-focusable="true"
              onChange={(event) => {
                setSearch(event.target.value)
                setActiveIndex(0)
                hasNavigatedRef.current = false
              }}
            />
            <div className="witness-picker__filters" aria-label="Фільтр за типом документа">
              {kinds.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  data-picker-focusable="true"
                  aria-pressed={activeKind === kind}
                  className={"witness-picker__filter" + (activeKind === kind ? " is-active" : "")}
                  onClick={() => {
                    setActiveKind(kind)
                    setActiveIndex(0)
                    hasNavigatedRef.current = false
                  }}
                >
                  {kind}
                </button>
              ))}
            </div>
            <span className="witness-picker__count">{getUkrainianDocumentCount(visibleOptions.length)}</span>
          </div>
        )}

        <div
          className="witness-picker__options"
          id={id + "-listbox"}
          role="listbox"
          aria-label={label}
          aria-activedescendant={activeOption ? id + "-option-" + activeOption.id : undefined}
        >
          {visibleOptions.length ? visibleOptions.map((option, index) => (
            <div
              key={option.id}
              id={id + "-option-" + option.id}
              role="option"
              aria-selected={value === option.id}
              aria-label={option.label}
              className={"witness-picker__option" + (value === option.id ? " is-selected" : "") + (activeIndex === index ? " is-active" : "") + (isDocument ? " witness-picker__option--document" : " witness-picker__option--quote")}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseOption(option)}
            >
              {isDocument && (
                <div className="witness-picker__option-meta">
                  {option.kind && <span className="witness-picker__kind">{option.kind}</span>}
                  {option.date && <time>{option.date}</time>}
                </div>
              )}
              <span className="witness-picker__option-text">
                {isDocument ? option.label : option.label.replace(/^[«"“]+|[»"”]+$/g, "")}
              </span>
              {value === option.id && <span className="witness-picker__check" aria-hidden="true">✓</span>}
            </div>
          )) : (
            <p className="witness-picker__empty">Нічого не знайдено</p>
          )}
        </div>
      </div>
    </>,
    document.body,
  ) : null

  return (
    <div className={"witness-picker" + (isOpen ? " is-open" : "") + (disabled ? " is-disabled" : "")}>
      <span className="witness-picker__label" id={id + "-label"}>{label}</span>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-labelledby={id + "-label"}
        className="witness-picker__trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={id + "-listbox"}
        aria-activedescendant={isOpen && activeOption ? id + "-option-" + activeOption.id : undefined}
        disabled={disabled}
        onClick={() => isOpen ? closePicker(false) : openPicker()}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={selected ? "witness-picker__value" : "witness-picker__placeholder"}>
          {selected?.label ?? placeholder}
        </span>
        <span className="witness-picker__chevron" aria-hidden="true">⌄</span>
      </button>
      {panel}
    </div>
  )
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

function moveCorrectItemFromFirst(order: string[], correctId: string) {
  if (order[0] !== correctId) return order
  const swapIndex = order.findIndex((id, index) => index > 0 && id !== correctId)
  if (swapIndex === -1) return order

  const result = [...order]
  ;[result[0], result[swapIndex]] = [result[swapIndex], result[0]]
  return result
}

function createInitialState(): CrossCheckState {
  return {
    isOpen: true,
    step: "intro",
    introPlayed: false,
    witnessOrder: shuffle(config.witnesses),
    quoteOrder: moveCorrectItemFromFirst(shuffle(config.quotes.map((quote) => quote.id)), caseKey.correctQuoteId),
    documentOrder: moveCorrectItemFromFirst(shuffle(config.documents.map((document) => document.id)), caseKey.correctDocumentId),
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

function readState(): CrossCheckState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const saved = JSON.parse(raw) as Partial<CrossCheckState>
    const fallback = createInitialState()
    const currentWitnesses = new Set(config.witnesses)
    const currentDocumentIds = new Set(config.documents.map((document) => document.id))
    const savedWitnessOrder = Array.isArray(saved.witnessOrder)
      ? [...new Set(saved.witnessOrder.filter((witness) => currentWitnesses.has(witness)))]
      : []
    const savedDocumentOrder = Array.isArray(saved.documentOrder)
      ? [...new Set(saved.documentOrder.filter((id) => currentDocumentIds.has(id)))]
      : []

    return {
      ...fallback,
      ...saved,
      isOpen: true,
      witnessOrder: [
        ...savedWitnessOrder,
        ...fallback.witnessOrder.filter((witness) => !savedWitnessOrder.includes(witness)),
      ],
      quoteOrder: Array.isArray(saved.quoteOrder)
        ? moveCorrectItemFromFirst(saved.quoteOrder, caseKey.correctQuoteId)
        : fallback.quoteOrder,
      documentOrder: [
        ...savedDocumentOrder,
        ...fallback.documentOrder.filter((id) => !savedDocumentOrder.includes(id)),
      ],
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
    // Без localStorage сценарій не блокуємо.
  }
}

function getHintLevel(failedAttempts: number, hintsUsed: number) {
  return Math.min(3, failedAttempts + hintsUsed)
}

function getPoolItem(pool: "A" | "B", id: string) {
  return (pool === "A" ? config.failureAudioA : config.failureAudioB).find((item) => item.id === id)
}

function nextPoolItem(
  state: CrossCheckState,
  pool: "A" | "B",
) {
  const order = pool === "A" ? state.failureOrderA : state.failureOrderB
  const index = pool === "A" ? state.failureIndexA : state.failureIndexB
  const source = pool === "A" ? config.failureAudioA : config.failureAudioB

  if (index < order.length) {
    return {
      id: order[index],
      order,
      index: index + 1,
    }
  }

  const freshOrder = shuffle(source.map((item) => item.id))
  return {
    id: freshOrder[0],
    order: freshOrder,
    index: 1,
  }
}

export default function WitnessCrossCheck({ onBack, onSuccess }: Props) {
  const { upsertContradiction } = useInvestigatorNotebook()
  const { playVoice, stopVoice } = useAudioManager()
  const [state, setState] = useState<CrossCheckState>(() => readState())
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const successCallbackRef = useRef(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    if (state.introPlayed || state.isSolved) {
      if (state.step === "intro" && !state.isSolved) {
        setState((current) => ({ ...current, step: "suspect" }))
      }
      return
    }

    const next = { introPlayed: true, feedbackAudio: config.audio.intro }
    setState((current) => ({ ...current, ...next }))
    setIsAudioPlaying(true)

    void playVoice({
      src: config.audio.intro,
      duckDurationMs: config.ducking.durationMs,
      duckTargetVolume: config.ducking.targetVolume,
      onStart: () => setIsAudioPlaying(true),
      onEnded: () => {
        setIsAudioPlaying(false)
      },
    }).then((started) => {
      if (!started) {
        setIsAudioPlaying(false)
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

  async function playAssistantAudio(src: string, after?: () => void) {
    setIsAudioPlaying(true)

    const started = await playVoice({
      src,
      duckDurationMs: config.ducking.durationMs,
      duckTargetVolume: config.ducking.targetVolume,
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

  async function playFailureAndHint(
    pool: "A" | "B",
    hintLevel: number,
    next: Partial<CrossCheckState>,
  ) {
    const poolItem = nextPoolItem(state, pool)
    const nextFailureState = pool === "A"
      ? { failureOrderA: poolItem.order, failureIndexA: poolItem.index }
      : { failureOrderB: poolItem.order, failureIndexB: poolItem.index }

    patch({
      ...next,
      feedback: poolItemText(pool, poolItem.id),
      feedbackAudio: poolItem.id,
      ...nextFailureState,
    })

    await playAssistantAudio(poolItem.id, async () => {
      if (hintLevel > 0) {
        patch({ currentHint: hintLevel })
        await playAssistantAudio(config.audioHints[hintLevel as 1 | 2 | 3])
      }
    })
  }

  function poolItemText(pool: "A" | "B", id: string) {
    return getPoolItem(pool, id)?.text ?? ""
  }

  function chooseWitness(witness: string) {
    if (witness === caseKey.witness) {
      patch({
        selectedWitness: witness,
        step: "evidence",
        feedback: "",
        feedbackAudio: "",
        currentHint: 0,
      })
      return
    }

    const failedAttempts = state.failedAttempts + 1
    const hintLevel = getHintLevel(failedAttempts, state.hintsUsed)

    void playFailureAndHint("A", hintLevel, {
      selectedWitness: witness,
      step: "suspect-feedback",
      failedAttempts,
      maxHintLevel: Math.max(state.maxHintLevel, hintLevel),
      currentHint: 0,
    })
  }

  async function requestHint() {
    if (isAudioPlaying || state.maxHintLevel >= 3) return

    const level = Math.min(3, Math.max(1, state.failedAttempts + state.hintsUsed + 1))
    const hintsUsed = state.hintsUsed + 1

    patch({
      hintsUsed,
      maxHintLevel: Math.max(state.maxHintLevel, level),
      currentHint: level,
    })

    await playAssistantAudio(config.audioHints[level as 1 | 2 | 3])
  }

  async function submitEvidence() {
    if (isAudioPlaying || !state.selectedQuoteId || !state.selectedDocumentId) return

    const quote = config.quotes.find((item) => item.id === state.selectedQuoteId)
    const document = config.documents.find((item) => item.id === state.selectedDocumentId)
    if (!quote || !document) return

    const isCorrectQuote = quote.id === caseKey.correctQuoteId
    const isCorrectDocument = document.id === caseKey.correctDocumentId

    if (isCorrectQuote && isCorrectDocument) {
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
        feedback: config.successText,
        feedbackAudio: config.audio.success,
        savedRecordId: recordId,
        currentHint: 0,
      })

      await playAssistantAudio(config.audio.success)
      return
    }

    const failedAttempts = state.failedAttempts + 1
    const isCorrectQuoteWithWrongDocument = isCorrectQuote && !isCorrectDocument
    const isCorrectDocumentWithWrongQuote = !isCorrectQuote && isCorrectDocument
    const pool: "A" | "B" = isCorrectDocumentWithWrongQuote ? "B" : "A"
    const hintLevel = isCorrectQuoteWithWrongDocument
      ? 3
      : getHintLevel(failedAttempts, state.hintsUsed)

    const nextHintsUsed = state.hintsUsed
    const maxHintLevel = Math.max(state.maxHintLevel, hintLevel)

    const recordId = upsertContradiction({
      witness: caseKey.witness,
      quoteId: quote.id,
      quote: quote.text,
      documentId: document.id,
      document: document.title,
      failedAttempts,
      hintsUsed: nextHintsUsed,
      maxHintLevel,
      status: "pending",
    })

    await playFailureAndHint(pool, hintLevel, {
      step: "evidence",
      failedAttempts,
      hintsUsed: nextHintsUsed,
      maxHintLevel,
      currentHint: 0,
      savedRecordId: recordId,
    })
  }

  function closeWindow() {
    stopVoice()
    setIsAudioPlaying(false)
    patch({ isOpen: false })
    onBack()
  }

  function continueToStepTwo() {
    stopVoice()
    setIsAudioPlaying(false)
    patch({
      step: "suspect",
      feedback: "",
      feedbackAudio: "",
      currentHint: 0,
    })
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
              <div className="witness-cross-check__intro-body">
                <p>{config.introText}</p>
                <button
                  type="button"
                  className="witness-cross-check__primary"
                  onClick={continueToStepTwo}
                >
                  Перейти до кроку 2 →
                </button>
              </div>
            </section>
          )}

          {state.step === "suspect" && (
            <section className="witness-cross-check__step">
              <span className="witness-cross-check__step-label">КРОК 2</span>
              <h2>Хто з допитаних, на вашу думку, говорить неправду або щось замовчує?</h2>
              <div className="witness-cross-check__options">
                {state.witnessOrder.map((witness) => (
                  <button key={witness} type="button" onClick={() => chooseWitness(witness)}>
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
              <button
                type="button"
                className="witness-cross-check__primary"
                disabled={isAudioPlaying}
                onClick={() => patch({ step: "suspect", selectedWitness: "", currentHint: 0, feedback: "" })}
              >
                Спробувати ще раз
              </button>
            </section>
          )}

          {state.step === "evidence" && (
            <section className="witness-cross-check__step">
              <span className="witness-cross-check__step-label">КРОК 3</span>
              <h2>Оберіть цитату зі свідчень і документ, який її спростовує.</h2>

              <div className="witness-cross-check__evidence">
                <EvidencePicker
                  id="witness-quote"
                  label="ЦИТАТА ЗІ СВІДЧЕНЬ"
                  placeholder="Оберіть цитату зі свідчень"
                  value={state.selectedQuoteId}
                  disabled={isAudioPlaying}
                  variant="quote"
                  options={state.quoteOrder.flatMap((id) => {
                    const quote = config.quotes.find((item) => item.id === id)
                    return quote ? [{ id: quote.id, label: quote.text }] : []
                  })}
                  onChange={(selectedQuoteId) => patch({ selectedQuoteId, feedback: "" })}
                />

                <EvidencePicker
                  id="witness-document"
                  label="ДОКУМЕНТ"
                  placeholder="Оберіть документ зі справи"
                  value={state.selectedDocumentId}
                  disabled={isAudioPlaying}
                  variant="document"
                  options={state.documentOrder.flatMap((id) => {
                    const document = config.documents.find((item) => item.id === id)
                    return document ? [{ id: document.id, label: document.title, kind: document.kind, date: document.date }] : []
                  })}
                  onChange={(selectedDocumentId) => patch({ selectedDocumentId, feedback: "" })}
                />

                <button
                  type="button"
                  className="witness-cross-check__primary"
                  disabled={isAudioPlaying || !state.selectedQuoteId || !state.selectedDocumentId}
                  onClick={() => void submitEvidence()}
                >
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
                <button
                  type="button"
                  className="witness-cross-check__primary"
                  onClick={() => {
                    if (successCallbackRef.current) return
                    successCallbackRef.current = true
                    onSuccess()
                  }}
                >
                  Перейти до 5 конверту →
                </button>
              )}
            </section>
          )}

          {state.step !== "success" && (
            <footer className="witness-cross-check__footer">
              <div>
                {state.maxHintLevel < 3 ? (
                  <button type="button" onClick={() => void requestHint()} disabled={isAudioPlaying}>
                    Попросити підказку
                  </button>
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
