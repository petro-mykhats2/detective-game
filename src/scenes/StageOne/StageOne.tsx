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
  { id: "vehicle", category: "Автомобіль і коробка передач", description: "Положення важеля та стан двигуна",
    title: "Чому положення важеля коробки передач потребує перевірки?",
    options: [
      { id: "a", text: "Нейтральне положення однозначно доводить, що автомобіль був несправним." },
      { id: "b", text: "Нейтральне положення саме по собі доводить умисні дії водія." },
      { id: "c", text: "Положення важеля зафіксоване в протоколі, але його значення для механізму ДТП потребує автотехнічної перевірки." },
    ], correct: "c",
    explanation: "Зафіксоване нейтральне положення — це факт огляду, але саме по собі воно не пояснює механізм ДТП. Потрібна автотехнічна перевірка.",
    hint: "Розділіть те, що слідчий безпосередньо зафіксував під час огляду, і те, що ще треба встановити. Положення важеля — спостереження, а не готове пояснення причин ДТП." },
  { id: "traces", category: "Сліди на місці події", description: "Гальмування та подряпини на бампері",
    title: "Що можна сказати про відсутність слідів гальмування та подряпини на задньому бампері?",
    options: [
      { id: "a", text: "Це беззаперечно доводить, що автомобіль штовхнув інший транспортний засіб." },
      { id: "b", text: "Ці обставини зафіксовані, але їхнє походження та значення потрібно додатково перевірити." },
      { id: "c", text: "Вони доводять, що водій не намагався гальмувати." },
    ], correct: "b",
    explanation: "Відсутність слідів гальмування не встановлює причину, а подряпини не доводять контакту з іншим автомобілем. Потрібні додаткові дослідження.",
    hint: "Не робіть висновок лише з відсутності сліду. Подряпина сама по собі не пояснює, коли, як і за яких обставин вона утворилася." },
  { id: "injuries", category: "Ушкодження потерпілого", description: "Локалізація травм та їх походження",
    title: "Чому травма тім’яної ділянки голови потребує уваги?",
    options: [
      { id: "a", text: "Вона автоматично доводить, що водій не був пристебнутий ременем." },
      { id: "b", text: "Її потрібно оцінити разом з іншими ушкодженнями та обставинами; самостійно робити висновок про механізм травми не можна." },
      { id: "c", text: "Вона однозначно доводить удар стороннім предметом до ДТП." },
    ], correct: "b",
    explanation: "Локалізація ушкодження — підстава для судово-медичного дослідження, але не готовий висновок про те, як саме воно виникло.",
    hint: "Локалізація ушкодження може бути важливою для перевірки версій, але механізм його утворення має оцінити фахівець разом з іншими даними." },
  { id: "time", category: "Час події", description: "Показання свідка та дзвінок до поліції",
    title: "Як слід оцінити час події та попередню оцінку часу смерті?",
    options: [
      { id: "a", text: "Час ДТП точно дорівнює часу дзвінка свідка до поліції." },
      { id: "b", text: "Показання свідка й попередню оцінку потрібно зіставити та перевірити; точний час за цими даними встановлювати не можна." },
      { id: "c", text: "Час смерті можна точно визначити лише за температурою тіла, наведеною в протоколі." },
    ], correct: "b",
    explanation: "Свідок повідомив про подію приблизно о 22:52, а дзвінок до поліції був о 22:54. Це різні часові орієнтири; точного часу смерті ці дані не встановлюють.",
    hint: "Відрізняйте приблизний час, коли свідок помітив подію, від часу здійснення дзвінка. Ці позначки не тотожні точному часу ДТП або смерті." },
  { id: "driver", category: "Стан водія та швидкість", description: "Що можна і чого не можна стверджувати",
    title: "Чи дозволяють первинні матеріали визначити стан водія та швидкість автомобіля?",
    options: [
      { id: "a", text: "Так, це можна точно встановити з факту виїзду автомобіля за межі дороги." },
      { id: "b", text: "Ні. Наявних даних недостатньо; ці обставини не можна стверджувати без відповідних доказів і перевірок." },
      { id: "c", text: "Так, тяжкість наслідків доводить перевищення швидкості." },
    ], correct: "b",
    explanation: "Сам факт ДТП та його наслідки не встановлюють ані стан водія, ані швидкість руху. Для висновків потрібні окремі дані й дослідження.",
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
        <span><i /> АНАЛІТИЧНИЙ ТЕРМІНАЛ</span>
        <span>ЕТАП 01 · СПРАВА № 12026170010000456</span>
      </header>
      <div className="stage-one-wrap">
        <div className="narration-kicker"><span>КОНВЕРТ № 1</span><span>ПЕРВИННІ МАТЕРІАЛИ</span></div>
        <h1 className="stage-one-heading">Оберіть напрям розслідування</h1>
        <p className="stage-one-lead">Переглядайте категорії у зручному порядку. Відповідь і коротке пояснення з’являться одразу — не потрібно надсилати весь тест на перевірку.</p>
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
            <span className="stage-one-category__number">§</span><span className="stage-one-category__body"><span className="stage-one-category__title">Проміжний підсумок</span><span className="stage-one-category__description">Встановлені факти та обставини, які ще треба перевірити</span></span><span className="stage-one-category__status">↗</span>
          </button>
        </div>
        <footer className="stage-one-home-footer">
          <button type="button" className="stage-one-secondary" onClick={onBack}>← Повернутися до інструкції</button>
          <button type="button" className="stage-one-primary" onClick={onComplete}>Перейти до наступного етапу →</button>
        </footer>
      </div>

      {view !== null && <div className="stage-one-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && view !== "helper" && !revealing) backToCategories() }}>
        <section className="stage-one-modal" role="dialog" aria-modal="true" aria-labelledby="stage-one-modal-title">
          <div className="stage-one-modal__top"><span className="stage-one-modal__label">{view === "helper" ? "ПОРАДА НАПАРНИКА" : view === "summary" ? "ДОСЬЄ · ПРОМІЖНИЙ ПІДСУМОК" : "АНАЛІЗ ДОКАЗІВ"}</span><button type="button" className="stage-one-modal__close" onClick={view === "helper" ? closeHelper : backToCategories} aria-label="Закрити вікно">×</button></div>

          {view === "question" && active && <div key={active.id} className="stage-one-modal__content">
            <div className="stage-one-modal__category">{active.category}</div>
            <h2 id="stage-one-modal-title">{active.title}</h2>
            <div className="stage-one-helper-callout"><span className="stage-one-helper-avatar" aria-hidden="true">?</span><span><strong>Потрібна підказка?</strong><small>Помічник пояснить, на що звернути увагу, не розкриваючи відповідь.</small></span><button type="button" onClick={openHelper}>Допомога</button></div>
            <div className="stage-one-modal__options">{active.options.map((option, i) => {
              const chosen = choice === option.id
              const showState = resultVisible && chosen
              const correct = option.id === active.correct
              return <button type="button" key={option.id} disabled={revealing} className={`stage-one-modal-option ${chosen ? "is-selected" : ""} ${showState && correct ? "is-correct" : ""} ${showState && !correct ? "is-incorrect" : ""}`} onClick={() => choose(option.id)}>
                <span className="stage-one-modal-option__letter">{String.fromCharCode(65 + i)}</span><span>{option.text}</span>{showState && <span className="stage-one-modal-option__mark">{correct ? "✓" : "×"}</span>}
              </button>
            })}</div>
            {revealing && <div className="stage-one-thinking" role="status"><span className="stage-one-thinking__pulse" /> АНАЛІЗУЄМО ВІДПОВІДЬ…</div>}
            {resultVisible && choice && <div className={`stage-one-answer-result ${choice === active.correct ? "is-correct" : "is-incorrect"}`} role="status"><div className="stage-one-answer-result__title">{choice === active.correct ? "ВІДПОВІДЬ ПРИЙНЯТО" : "ВАРТО ПЕРЕВІРИТИ ЩЕ РАЗ"}</div><p>{active.explanation}</p></div>}
            <div className="stage-one-modal__footer"><button type="button" className="stage-one-secondary" onClick={backToCategories}>← До категорій</button>{resultVisible && <button type="button" className="stage-one-primary" onClick={backToCategories}>Продовжити →</button>}</div>
          </div>}

          {view === "helper" && active && <div className="stage-one-modal__content stage-one-helper-view">
            <div className="stage-one-helper-large" aria-hidden="true">?</div><h2 id="stage-one-modal-title">Помічник слідчого</h2><p className="stage-one-helper-intro">Я допоможу розібратися, на що звернути увагу в цьому запитанні.</p>
            <div className="stage-one-helper-note"><span className="stage-one-helper-note__label">ПІДКАЗКА ДО ПИТАННЯ</span><p>{active.hint}</p></div>
            <p className="stage-one-helper-audio-note">{voicePlaying ? "Відтворюється озвучка підказки…" : "Якщо аудіофайл ще не додано, підказка буде доступна лише текстом."}</p>
            <div className="stage-one-modal__footer"><button type="button" className="stage-one-secondary" onClick={closeHelper}>← Назад до запитання</button><button type="button" className="stage-one-primary" onClick={playHelper}>▶ Прослухати підказку</button></div>
          </div>}

          {view === "summary" && <div className="stage-one-modal__content stage-one-summary-view">
            <h2 id="stage-one-modal-title">Що відомо на цьому етапі</h2><p className="stage-one-summary-intro">Первинні матеріали дають змогу визначити, що вже зафіксовано, але не дозволяють остаточно встановити механізм ДТП.</p>
            <h3>Зафіксовано в матеріалах</h3><ul><li>Свідок повідомив про аварію приблизно о 22:52; виклик поліції здійснено о 22:54.</li><li>Запалювання було ввімкнене, двигун не працював; важіль коробки передач перебував у нейтральному положенні.</li><li>Водій перебував за кермом і був пристебнутий ременем безпеки.</li></ul>
            <h3>Потребує перевірки</h3><ul><li>Відсутність слідів гальмування та характер подряпин на задньому бампері.</li><li>Походження й механізм утворення ушкоджень водія.</li><li>Механізм ДТП, стан водія та швидкість руху.</li></ul>
            <h3>Наступний крок</h3><p>Потрібні судово-медичне, автотехнічне та трасологічне дослідження. Їхні результати будуть надані на наступному етапі. Висновки експертиз тут не відкриваються.</p>
            <div className="stage-one-modal__footer"><button type="button" className="stage-one-secondary" onClick={backToCategories}>← До категорій</button><button type="button" className="stage-one-primary" onClick={onComplete}>Перейти далі →</button></div>
          </div>}
        </section>
      </div>}
      <audio ref={voiceRef} src={AUDIO_HELPER} preload="none" onEnded={() => setVoicePlaying(false)} onError={() => setVoicePlaying(false)} />
    </section>
  )
}
