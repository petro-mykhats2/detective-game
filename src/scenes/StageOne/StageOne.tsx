import { useState } from "react"

type Props = {
  onBack: () => void
  onComplete: () => void
}

type Question = {
  id: string
  title: string
  options: { id: string; text: string }[]
  correct: string
  explanation: string
}

const questions: Question[] = [
  {
    id: "vehicle-controls",
    title: "1. Чому положення важеля коробки передач потребує перевірки?",
    options: [
      { id: "a", text: "Нейтральне положення однозначно доводить, що автомобіль був несправним." },
      { id: "b", text: "Нейтральне положення саме по собі доводить умисні дії водія." },
      { id: "c", text: "Положення важеля зафіксоване в протоколі, але його значення для механізму ДТП потребує автотехнічної перевірки." },
    ],
    correct: "c",
    explanation: "Зафіксоване нейтральне положення — це факт огляду, але саме по собі воно не пояснює механізм ДТП. Потрібна автотехнічна перевірка.",
  },
  {
    id: "braking-and-bumper",
    title: "2. Що можна сказати про відсутність слідів гальмування та подряпини на задньому бампері?",
    options: [
      { id: "a", text: "Це беззаперечно доводить, що автомобіль штовхнув інший транспортний засіб." },
      { id: "b", text: "Ці обставини зафіксовані, але їхнє походження та значення потрібно додатково перевірити." },
      { id: "c", text: "Вони доводять, що водій не намагався гальмувати." },
    ],
    correct: "b",
    explanation: "Відсутність слідів гальмування не встановлює причину, а подряпини не доводять контакту з іншим автомобілем. Потрібні додаткові дослідження.",
  },
  {
    id: "injury-location",
    title: "3. Чому травма тім’яної ділянки голови потребує уваги?",
    options: [
      { id: "a", text: "Вона автоматично доводить, що водій не був пристебнутий ременем." },
      { id: "b", text: "Її потрібно оцінити разом з іншими ушкодженнями та обставинами; самостійно робити висновок про механізм травми не можна." },
      { id: "c", text: "Вона однозначно доводить удар стороннім предметом до ДТП." },
    ],
    correct: "b",
    explanation: "Локалізація ушкодження — підстава для судово-медичного дослідження, але не готовий висновок про те, як саме воно виникло.",
  },
  {
    id: "time-of-event",
    title: "4. Як слід оцінити час події та попередню оцінку часу смерті?",
    options: [
      { id: "a", text: "Час ДТП точно дорівнює часу дзвінка свідка до поліції." },
      { id: "b", text: "Показання свідка й попередню оцінку потрібно зіставити та перевірити; точний час за цими даними встановлювати не можна." },
      { id: "c", text: "Час смерті можна точно визначити лише за температурою тіла, наведеною в протоколі." },
    ],
    correct: "b",
    explanation: "Свідок повідомив про подію приблизно о 22:52, а дзвінок до поліції був о 22:54. Це різні часові орієнтири; точного часу смерті ці дані не встановлюють.",
  },
  {
    id: "driver-condition-and-speed",
    title: "5. Чи дозволяють первинні матеріали визначити стан водія та швидкість автомобіля?",
    options: [
      { id: "a", text: "Так, це можна точно встановити з факту виїзду автомобіля за межі дороги." },
      { id: "b", text: "Ні. Наявних даних недостатньо; ці обставини не можна стверджувати без відповідних доказів і перевірок." },
      { id: "c", text: "Так, тяжкість наслідків доводить перевищення швидкості." },
    ],
    correct: "b",
    explanation: "Сам факт ДТП та його наслідки не встановлюють ані стан водія, ані швидкість руху. Для висновків потрібні окремі дані й дослідження.",
  },
]

export default function StageOne({ onBack, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const correctCount = questions.filter((q) => answers[q.id] === q.correct).length
  const allAnswered = questions.every((q) => Boolean(answers[q.id]))
  const allCorrect = correctCount === questions.length

  function checkAnswers() {
    setChecked(true)
    if (allCorrect) setShowSummary(true)
  }

  return (
    <section className="stage-one-screen" aria-label="Етап 1: аналіз первинних матеріалів">
      <div className="scene-topline">
        <span><i /> АНАЛІТИЧНИЙ ТЕРМІНАЛ</span>
        <span>ЕТАП 01 · СПРАВА № 12026170010000456</span>
      </div>

      <div className="stage-one-wrap">
        <div className="narration-kicker"><span>КОНВЕРТ № 1</span><span>ПЕРВИННІ МАТЕРІАЛИ</span></div>
        <h1 className="stage-one-heading">Аналіз первинних матеріалів</h1>
        <p className="stage-one-lead">
          Ознайомтеся з документами фізичного конверта № 1 і дайте відповіді.
          Відокремлюйте зафіксовані факти від припущень. Не намагайтеся встановити
          причину ДТП до перевірки всіх обставин.
        </p>

        {questions.map((question) => (
          <fieldset className="stage-one-question" key={question.id}>
            <legend>{question.title}</legend>
            <div className="stage-one-options">
              {question.options.map((option) => (
                <label className="stage-one-option" key={option.id}>
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => {
                      setAnswers((current) => ({ ...current, [question.id]: option.id }))
                      setChecked(false)
                      setShowSummary(false)
                    }}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
            {checked && answers[question.id] !== question.correct && (
              <p className="stage-one-feedback"><strong>Потребує перегляду.</strong> {question.explanation}</p>
            )}
          </fieldset>
        ))}

        <div className="stage-one-actions">
          <button className="stage-one-secondary" onClick={onBack}>Повернутися до інструкції</button>
          <button className="stage-one-primary" disabled={!allAnswered} onClick={checkAnswers}>
            Перевірити відповіді
          </button>
        </div>

        {checked && !allCorrect && (
          <p className="stage-one-feedback" role="status">
            Правильних відповідей: {correctCount} із {questions.length}. Перегляньте пояснення біля запитань, змініть відповіді й перевірте ще раз.
          </p>
        )}

        {showSummary && (
          <div className="stage-one-summary" role="status">
            <div className="narration-kicker">ПЕРЕВІРКУ ЗАВЕРШЕНО</div>
            <h2>Проміжний підсумок етапу 1</h2>
            <p>Первинні матеріали дають змогу визначити, що вже зафіксовано, але не дозволяють остаточно встановити механізм ДТП.</p>
            <h3>Зафіксовано в матеріалах</h3>
            <ul>
              <li>Свідок повідомив про аварію приблизно о 22:52; виклик поліції здійснено о 22:54.</li>
              <li>Запалювання було ввімкнене, двигун не працював; важіль коробки передач перебував у нейтральному положенні.</li>
              <li>Водій перебував за кермом і був пристебнутий ременем безпеки.</li>
            </ul>
            <h3>Потребує перевірки</h3>
            <ul>
              <li>Відсутність слідів гальмування та характер подряпин на задньому бампері.</li>
              <li>Походження й механізм утворення ушкоджень водія.</li>
              <li>Механізм ДТП, стан водія та швидкість руху.</li>
            </ul>
            <h3>Наступний крок</h3>
            <p>Потрібні судово-медичне, автотехнічне та трасологічне дослідження. Їхні результати будуть надані на наступному етапі. На цьому етапі висновки експертиз не відкриваються.</p>
            <div className="stage-one-actions">
              <button className="stage-one-primary" onClick={onComplete}>Завершити етап і перейти далі</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
