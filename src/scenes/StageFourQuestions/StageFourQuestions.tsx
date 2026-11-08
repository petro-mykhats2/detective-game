import "./StageFourQuestions.css"

type StageFourQuestionsProps = {
  onBack: () => void
}

const CONTROL_QUESTIONS = [
  "Яка версія події зараз підтверджується сукупністю матеріалів?",
  "Які факти безпосередньо спростовують початкову версію ДТП?",
  "Хто з фігурантів має перевірений мотив, можливість і зв'язок із місцем події?",
  "Які докази ще потрібно отримати або перевірити, щоб підтвердити версію слідства?",
]

export default function StageFourQuestions({
  onBack,
}: StageFourQuestionsProps) {
  return (
    <main className="stage-four-questions" aria-label="Контрольні запитання справи">
      <div className="stage-four-questions__topline">
        <span>
          <i /> КОНТРОЛЬНІ ЗАПИТАННЯ
        </span>
        <span>ЕТАП 04 · СПРАВА № 12026170010000456</span>
      </div>

      <div className="stage-four-questions__wrap">
        <div className="narration-kicker">
          <span>НАПАРНИК · АНДРІЙ</span>
          <span>ПІСЛЯ ОПРАЦЮВАННЯ КОНВЕРТА № 4</span>
        </div>

        <section className="stage-four-questions__card">
          <div className="stage-four-questions__mark" aria-hidden="true">
            ?
          </div>

          <div>
            <div className="stage-four-questions__eyebrow">
              КОНТРОЛЬНА ТОЧКА РОЗСЛІДУВАННЯ
            </div>
            <h1>Ключові запитання справи</h1>
            <p className="stage-four-questions__intro">
              Перш ніж рухатися далі, зафіксуй власну версію події. Відповідай,
              спираючись на матеріали конверта № 4, а не на припущення.
            </p>

            <div className="stage-four-questions__list">
              {CONTROL_QUESTIONS.map((question, index) => (
                <section
                  className="stage-four-questions__question"
                  key={question}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{question}</p>
                </section>
              ))}
            </div>

            <div className="stage-four-questions__actions">
              <button
                className="stage-one-secondary"
                type="button"
                onClick={onBack}
              >
                ← Повернутися до конверта № 4
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
