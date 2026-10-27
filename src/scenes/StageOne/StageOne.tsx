import { useEffect, useRef, useState } from "react"

type Props = { onBack: () => void; onComplete: () => void }
type Option = { id: string; text: string }
type Question = {
  id: string; category: string; description: string; title: string
  options: Option[]; correct: string; explanation: string; hint: string
}
type ModalView = "question" | "helper" | "summary" | null

// НАЛАШТУВАННЯ ІНТЕРАКТИВНОСТІ:
// ANSWER_REVEAL_DELAY_MS — пауза перед показом результату після вибору відповіді.
// CATEGORY_STAGGER_MS — затримка між появою карток категорій.
// AUDIO_* — шляхи до звуків інтерфейсу/озвучки. Додайте файли до public/audio/ пізніше.
// Відсутні аудіофайли не блокують роботу інтерфейсу.
const ANSWER_REVEAL_DELAY_MS = 850
const CATEGORY_STAGGER_MS = 75
const AUDIO_CATEGORY = "/audio/ui-category-click.mp3"
const AUDIO_ANSWER = "/audio/ui-answer-click.mp3"
const AUDIO_HELPER = "/audio/stage-one-helper.mp3"

const questions: Question[] = [
  { id: "vehicle", category: "Автомобіль і коробка передач", description: "Що може розповісти стан автомобіля?",
    title: "Чому положення важеля коробки передач потребує перевірки?",
    options: [
      { id: "a", text: "Нейтральне положення однозначно доводить, що автомобіль був несправним." },
      { id: "b", text: "Нейтральне положення саме по собі доводить умисні дії водія." },
      { id: "c", text: "Положення важеля зафіксоване в протоколі, але його значення для механізму ДТП потребує автотехнічної перевірки." },
    ], correct: "c",
    explanation: "Нейтральне положення зафіксували під час огляду. Але що воно означає для обставин ДТП — це ще належить з’ясувати за допомогою автотехнічного дослідження.",
    hint: "Розділіть те, що слідчий безпосередньо зафіксував під час огляду, і те, що ще треба встановити. Положення важеля — спостереження, а не готове пояснення причин ДТП." },
  { id: "traces", category: "Сліди на місці події", description: "Сліди є. Але чи відома їхня історія?",
    title: "Що можна сказати про відсутність слідів гальмування та подряпини на задньому бампері?",
    options: [
      { id: "a", text: "Це беззаперечно доводить, що автомобіль штовхнув інший транспортний засіб." },
      { id: "b", text: "Ці обставини зафіксовані, але їхнє походження та значення потрібно додатково перевірити." },
      { id: "c", text: "Вони доводять, що водій не намагався гальмувати." },
    ], correct: "b",
    explanation: "Слідів гальмування не виявили, а на бампері є подряпини. Та самі по собі ці деталі не пояснюють, як сталася ДТП і звідки взялися пошкодження.",
    hint: "Не робіть висновок лише з відсутності сліду. Подряпина сама по собі не пояснює, коли, як і за яких обставин вона утворилася." },
  { id: "injuries", category: "Ушкодження потерпілого", description: "Що можуть розповісти травми?",
    title: "Чому травма тім’яної ділянки голови потребує уваги?",
    options: [
      { id: "a", text: "Вона автоматично доводить, що водій не був пристебнутий ременем." },
      { id: "b", text: "Її потрібно оцінити разом з іншими ушкодженнями та обставинами; самостійно робити висновок про механізм травми не можна." },
      { id: "c", text: "Вона однозначно доводить удар стороннім предметом до ДТП." },
    ], correct: "b",
    explanation: "Місце ушкодження може стати важливою зачіпкою. Та щоб зрозуміти, як воно виникло, його потрібно зіставити з іншими даними й висновками фахівців.",
    hint: "Локалізація ушкодження може бути важливою для перевірки версій, але механізм його утворення має оцінити фахівець разом з іншими даними." },
  { id: "time", category: "Час події", description: "Кілька хвилин, які можуть мати значення.",
    title: "Як слід оцінити час події та попередню оцінку часу смерті?",
    options: [
      { id: "a", text: "Час ДТП точно дорівнює часу дзвінка свідка до поліції." },
      { id: "b", text: "Показання свідка й попередню оцінку потрібно зіставити та перевірити; точний час за цими даними встановлювати не можна." },
      { id: "c", text: "Час смерті можна точно визначити лише за температурою тіла, наведеною в протоколі." },
    ], correct: "b",
    explanation: "Свідок помітив подію приблизно о 22:52, а до поліції зателефонували о 22:54. Дві хвилини — це важлива різниця, але жодна з цих позначок сама по собі не встановлює точного часу ДТП чи смерті.",
    hint: "Відрізняйте приблизний час, коли свідок помітив подію, від часу здійснення дзвінка. Ці позначки не тотожні точному часу ДТП або смерті." },
  { id: "driver", category: "Стан водія та швидкість", description: "Що ми знаємо, а що лише припускаємо?",
    title: "Чи дозволяють первинні матеріали визначити стан водія та швидкість автомобіля?",
    options: [
      { id: "a", text: "Так, це можна точно встановити з факту виїзду автомобіля за межі дороги." },
      { id: "b", text: "Ні. Наявних даних недостатньо; ці обставини не можна стверджувати без відповідних доказів і перевірок." },
      { id: "c", text: "Так, тяжкість наслідків доводить перевищення швидкості." },
    ], correct: "b",
    explanation: "Наслідки ДТП ще не дають відповіді, якою була швидкість і в якому стані перебував водій. Для цього потрібні окремі докази та дослідження.",
    hint: "Наслідки події не дозволяють самостійно визначити швидкість або стан водія. Перевірте, чи є в первинних матеріалах прямі докази саме цих обставин." },
]

function playClick(path: string) {
  // Звук відтворюється після натискання; відсутній файл ігнорується без помилки для гравця.
  const audio = new Audio(path)
  audio.volume = 0.6
  void audio.play().catch(() => undefined)
}

export default function StageOne({ onBack, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [view, setView] = useState<ModalView>(null)
  const [choice, setChoice] = useState<string | null>(null)
  const [revealing, setRevealing] = useState(false)
  const [resultVisible, setResultVisible] = useState(false)
  const [voicePlaying, setVoicePlaying] = useState(false)
  const timer = useRef<number | null>(null)
  const voiceRef = useRef<HTMLAudioElement>(null)
  const active = questions.find((q) => q.id === activeId) ?? null
  const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    voiceRef.current?.pause()
  }, [])

  function openQuestion(q: Question) {
    playClick(AUDIO_CATEGORY)
    setActiveId(q.id)
    setChoice(answers[q.id] ?? null)
    setResultVisible(Boolean(answers[q.id]))
    setRevealing(false)
    setView("question")
  }
  function choose(id: string) {
    if (revealing || !active) return
    playClick(AUDIO_ANSWER)
    setChoice(id)
    setResultVisible(false)
    setRevealing(true)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setAnswers((old) => ({ ...old, [active.id]: id }))
      setRevealing(false)
      setResultVisible(true)
      timer.current = null
    }, ANSWER_REVEAL_DELAY_MS)
  }
  function backToCategories() {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    setRevealing(false)
    setView(null)
    setActiveId(null)
  }
  function openHelper() {
    voiceRef.current?.pause()
    setVoicePlaying(false)
    setView("helper")
  }
  function playHelper() {
    const audio = voiceRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.volume = 0.85
    setVoicePlaying(true)
    void audio.play().catch(() => setVoicePlaying(false))
  }
  function closeHelper() {
    voiceRef.current?.pause()
    setVoicePlaying(false)
    setView("question")
  }

  return (
    <section className="stage-one-screen" aria-label="Етап 1: аналіз первинних матеріалів">
      <header className="scene-topline stage-one-topline">
        <span><i /> МАТЕРІАЛИ СПРАВИ</span>
        <span>ЕТАП 01 · СПРАВА № 12026170010000456</span>
      </header>
      <div className="stage-one-wrap">
        <div className="narration-kicker"><span>КОНВЕРТ № 1</span><span>ПЕРВИННІ МАТЕРІАЛИ</span></div>
        <h1 className="stage-one-heading">З чого почнемо?</h1>
        <p className="stage-one-lead">У кожної деталі є своя історія. Перевір матеріали у зручному порядку: після кожної відповіді ми розберемо, що вона означає. Не поспішай із висновками — важливо відрізняти встановлені факти від припущень.</p>
        <div className="stage-one-progress" aria-live="polite"><span className="stage-one-progress__dot" /><span>ОПРАЦЬОВАНО КАТЕГОРІЙ</span><strong>{answeredCount} / {questions.length}</strong></div>
        <div className="stage-one-categories">
          {questions.map((q, i) => (
            <button type="button" key={q.id} className={`stage-one-category ${answers[q.id] ? "is-answered" : ""}`} style={{ animationDelay: `${i * CATEGORY_STAGGER_MS}ms` }} onClick={() => openQuestion(q)}>
              <span className="stage-one-category__number">{String(i + 1).padStart(2, "0")}</span>
              <span className="stage-one-category__body"><span className="stage-one-category__title">{q.category}</span><span className="stage-one-category__description">{q.description}</span></span>
              <span className="stage-one-category__status">{answers[q.id] ? "✓" : "↗"}</span>
            </button>
          ))}
          <button type="button" className="stage-one-category stage-one-category--summary" style={{ animationDelay: `${questions.length * CATEGORY_STAGGER_MS}ms` }} onClick={() => { playClick(AUDIO_CATEGORY); setView("summary") }}>
            <span className="stage-one-category__number">§</span><span className="stage-one-category__body"><span className="stage-one-category__title">Що ми з’ясували?</span><span className="stage-one-category__description">Збери докупи факти. Відкриті запитання поки залишаються.</span></span><span className="stage-one-category__status">↗</span>
          </button>
        </div>
        <footer className="stage-one-home-footer">
          <button type="button" className="stage-one-secondary" onClick={onBack}>← Назад до вступу</button>
          <button type="button" className="stage-one-primary" onClick={onComplete}>До наступних матеріалів →</button>
        </footer>
      </div>

      {view !== null && <div className="stage-one-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && view !== "helper" && !revealing) backToCategories() }}>
        <section className="stage-one-modal" role="dialog" aria-modal="true" aria-labelledby="stage-one-modal-title">
          <div className="stage-one-modal__top"><span className="stage-one-modal__label">{view === "helper" ? "ПОРАДА НАПАРНИКА" : view === "summary" ? "ДОСЬЄ · ЩО МИ З’ЯСУВАЛИ?" : "РОЗБИРАЄМО ДЕТАЛІ"}</span><button type="button" className="stage-one-modal__close" onClick={view === "helper" ? closeHelper : backToCategories} aria-label="Закрити вікно">×</button></div>

          {view === "question" && active && <div key={active.id} className="stage-one-modal__content">
            <div className="stage-one-modal__category">{active.category}</div>
            <h2 id="stage-one-modal-title">{active.title}</h2>
            <div className="stage-one-helper-callout"><span className="stage-one-helper-avatar" aria-hidden="true">?</span><span><strong>Не бачиш зачіпки?</strong><small>Напарник підкаже, куди придивитися, але не розкриє відповіді.</small></span><button type="button" onClick={openHelper}>Підказка</button></div>
            <div className="stage-one-modal__options">{active.options.map((option, i) => {
              const chosen = choice === option.id
              const showState = resultVisible && chosen
              const correct = option.id === active.correct
              return <button type="button" key={option.id} disabled={revealing} className={`stage-one-modal-option ${chosen ? "is-selected" : ""} ${showState && correct ? "is-correct" : ""} ${showState && !correct ? "is-incorrect" : ""}`} onClick={() => choose(option.id)}>
                <span className="stage-one-modal-option__letter">{String.fromCharCode(65 + i)}</span><span>{option.text}</span>{showState && <span className="stage-one-modal-option__mark">{correct ? "✓" : "×"}</span>}
              </button>
            })}</div>
            {revealing && <div className="stage-one-thinking" role="status"><span className="stage-one-thinking__pulse" /> ЗІСТАВЛЯЄМО ОБСТАВИНИ…</div>}
            {resultVisible && choice && <div className={`stage-one-answer-result ${choice === active.correct ? "is-correct" : "is-incorrect"}`} role="status"><div className="stage-one-answer-result__title">{choice === active.correct ? "САМЕ ТАК. АЛЕ КРАПКУ СТАВИТИ ЗАРАНО." : "НЕ ПОСПІШАЙ ІЗ ВИСНОВКОМ."}</div><p>{active.explanation}</p></div>}
            <div className="stage-one-modal__footer"><button type="button" className="stage-one-secondary" onClick={backToCategories}>← До матеріалів</button>{resultVisible && <button type="button" className="stage-one-primary" onClick={backToCategories}>Далі →</button>}</div>
          </div>}

          {view === "helper" && active && <div className="stage-one-modal__content stage-one-helper-view">
            <div className="stage-one-helper-large" aria-hidden="true">?</div><h2 id="stage-one-modal-title">Твій напарник</h2><p className="stage-one-helper-intro">Давай подивимось, яка деталь тут справді важлива.</p>
            <div className="stage-one-helper-note"><span className="stage-one-helper-note__label">ЗАЧІПКА</span><p>{active.hint}</p></div>
            <p className="stage-one-helper-audio-note">{voicePlaying ? "Напарник говорить…" : "Поки що підказка доступна в тексті."}</p>
            <div className="stage-one-modal__footer"><button type="button" className="stage-one-secondary" onClick={closeHelper}>← Повернутися до запитання</button><button type="button" className="stage-one-primary" onClick={playHelper}>▶ Прослухати підказку</button></div>
          </div>}

          {view === "summary" && <div className="stage-one-modal__content stage-one-summary-view">
            <h2 id="stage-one-modal-title">Що ми маємо на цей момент?</h2><p className="stage-one-summary-intro">Перші матеріали вже окреслюють картину події. Та між зафіксованими обставинами й відповіддю на головне запитання ще залишається відстань.</p>
            <h3>Встановлено та зафіксовано</h3><ul><li>Свідок повідомив про аварію приблизно о 22:52; виклик поліції здійснено о 22:54.</li><li>Запалювання було ввімкнене, двигун не працював; важіль коробки передач перебував у нейтральному положенні.</li><li>Водій перебував за кермом і був пристебнутий ременем безпеки.</li></ul>
            <h3>Поки що залишається загадкою</h3><ul><li>Відсутність слідів гальмування та характер подряпин на задньому бампері.</li><li>Походження й механізм утворення ушкоджень водія.</li><li>Механізм ДТП, стан водія та швидкість руху.</li></ul>
            <h3>Розслідування триває</h3><p>Попереду — судово-медичне, автотехнічне та трасологічне дослідження. Їхні результати можуть змінити уявлення про подію. Поки що остаточних висновків немає.</p>
            <div className="stage-one-modal__footer"><button type="button" className="stage-one-secondary" onClick={backToCategories}>← До матеріалів</button><button type="button" className="stage-one-primary" onClick={onComplete}>До наступних матеріалів →</button></div>
          </div>}
        </section>
      </div>}
      <audio ref={voiceRef} src={AUDIO_HELPER} preload="none" onEnded={() => setVoicePlaying(false)} onError={() => setVoicePlaying(false)} />
    </section>
  )
}
