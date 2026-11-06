import "./FourthEnvelope.css"

type Props = {
  onComplete: () => void
}

export default function FourthEnvelope({ onComplete }: Props) {
  return (
    <main className="fourth-envelope" aria-label="Конверт 4">
      <div className="fourth-envelope__wrap">
        <div className="fourth-envelope__top">
          <span><i /> ПОВІДОМЛЕННЯ ВІД НАПАРНИКА</span>
          <span>ЕТАП 04 · КОНВЕРТ 04</span>
        </div>

        <section className="fourth-envelope__card">
          <div className="fourth-envelope__portrait">
            <img
              src="/assistant-mark.png"
              alt="Андрій, напарник слідчого"
              onError={(event) => {
                event.currentTarget.style.display = "none"
              }}
            />
            <div className="fourth-envelope__portrait-fallback">А</div>
          </div>

          <div className="fourth-envelope__content">
            <div className="fourth-envelope__kicker">НАПАРНИК · АНДРІЙ</div>
            <h1>Конверт № 4</h1>
            <p className="fourth-envelope__message">
              Ну що, капітане, я приніс більшу частину документів, які ти просив.
              Відкривай 4 конверт. Тут дуже багато допитів тощо. Перевіряй все.
            </p>

            <div className="fourth-envelope__actions">
              <button type="button" onClick={() => {}}>
                Запросити інші матеріали
              </button>
              <button type="button" onClick={() => {}}>
                Допоможеш розібратись, напарнику
              </button>
            </div>

            <button
              className="fourth-envelope__continue"
              type="button"
              onClick={onComplete}
            >
              Відкрити конверт № 4 <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <footer className="fourth-envelope__footer">
          <span>КРИМІНАЛЬНЕ ПРОВАДЖЕННЯ № 12026170010000456</span>
          <span>КОНВЕРТ 04</span>
        </footer>
      </div>
    </main>
  )
}
