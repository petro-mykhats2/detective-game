import { useEffect, useRef } from "react"
import "./StageFiveEnvelope.css"

const SCROLL_STORAGE_KEY = "detective-stage-five-scroll-v1"

const MATERIALS = [
  {
    number: "01",
    type: "ЕКСПЕРТИЗА",
    title: "Експертиза № 1",
    text: "Тестовий блок для майбутніх результатів експертизи. Тут згодом буде розміщено документ та коротке пояснення його значення для справи.",
  },
  {
    number: "02",
    type: "ДОПИТ",
    title: "Протокол допиту",
    text: "Тестовий блок для матеріалів допиту. Тут згодом з'явиться інформація про особу, яку вдалося викликати та допитати в межах наступного етапу.",
  },
  {
    number: "03",
    type: "МАТЕРІАЛ СПРАВИ",
    title: "Додаткові матеріали",
    text: "Місце для наступних документів, висновків або інших матеріалів, які відкриють новий напрямок розслідування.",
  },
]

export default function StageFiveEnvelope() {
  const scrollRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const restoreTimer = window.setTimeout(() => {
      try {
        const savedScrollTop = Number(localStorage.getItem(SCROLL_STORAGE_KEY) ?? "0")
        if (Number.isFinite(savedScrollTop)) {
          container.scrollTop = savedScrollTop
        }
      } catch {
        /* Скрол не критичний для роботи гри. */
      }
    }, 0)

    const saveScroll = () => {
      try {
        localStorage.setItem(SCROLL_STORAGE_KEY, String(container.scrollTop))
      } catch {
        /* Збереження може бути недоступним у приватному режимі. */
      }
    }

    container.addEventListener("scroll", saveScroll, { passive: true })

    return () => {
      window.clearTimeout(restoreTimer)
      container.removeEventListener("scroll", saveScroll)
    }
  }, [])

  return (
    <main ref={scrollRef} className="stage-five-envelope" aria-label="П'ятий конверт справи">
      <header className="stage-five-envelope__topline">
        <span><i /> НОВИЙ ФРАГМЕНТ СПРАВИ</span>
        <span>ЕТАП 05 · КОНВЕРТ № 5</span>
      </header>

      <div className="stage-five-envelope__wrap">
        <div className="stage-five-envelope__kicker">
          <span>ДОСЬЄ № 001 · ПРОДОВЖЕННЯ</span>
          <span>СТАТУС · ОПРАЦЮВАННЯ</span>
        </div>

        <section className="stage-five-envelope__hero">
          <div className="stage-five-envelope__stamp">05</div>
          <div>
            <div className="stage-five-envelope__identity">
              <span>КОНВЕРТ № 5</span>
              <small>НОВІ МАТЕРІАЛИ РОЗСЛІДУВАННЯ</small>
            </div>
            <h1>Матеріали, які змінюють напрямок справи</h1>
            <p>
              Капітане, ми отримали новий пакет матеріалів. У цьому конверті зібрані
              результати подальшої роботи: експертизи, протоколи допитів та інші
              документи, які можуть підтвердити або спростувати попередні версії.
            </p>
            <p>
              Поки що це тестове оформлення. Коли ти додаси реальні документи,
              кожен матеріал матиме власний зміст і значення для розслідування.
              Уважно зіставляй нові дані з тим, що вже встановлено у справі.
            </p>
          </div>
        </section>

        <section className="stage-five-envelope__materials" aria-label="Матеріали п'ятого конверта">
          <div className="stage-five-envelope__section-heading">
            <div>
              <span>ДОКУМЕНТИ ТА МАТЕРІАЛИ</span>
              <h2>Що надійшло у справі</h2>
            </div>
            <span className="stage-five-envelope__count">03 МАТЕРІАЛИ</span>
          </div>

          <div className="stage-five-envelope__grid">
            {MATERIALS.map((material) => (
              <article className="stage-five-envelope__material" key={material.number}>
                <div className="stage-five-envelope__material-top">
                  <span>{material.number}</span>
                  <span>{material.type}</span>
                </div>
                <h3>{material.title}</h3>
                <p>{material.text}</p>
                <button type="button" className="stage-five-envelope__open">
                  Відкрити матеріал →
                </button>
              </article>
            ))}
          </div>
        </section>

        <div className="stage-five-envelope__footer">
          <span><i /> ПЕРЕХІД ЗАФІКСОВАНО · РОЗСЛІДУВАННЯ ПРОДОВЖУЄТЬСЯ</span>
        </div>
      </div>
    </main>
  )
}
