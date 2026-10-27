import { useState } from "react"

type Props = { onBack: () => void; onComplete: () => void }

const AUDIO_STAGE_TWO_INTRO = "/audio/assistant-stage-two-intro.mp3" // Додайте озвучку пізніше.
const AUDIO_STAGE_TWO_NEXT = "/audio/assistant-stage-two-next.mp3" // Додайте озвучку пізніше.

function playDialogue(path: string) {
  const audio = new Audio(path)
  audio.volume = 1
  void audio.play().catch(() => undefined)
}

export default function StageTwo({ onBack, onComplete }: Props) {
  const [opened, setOpened] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const documents = [
    { id: "wife", number: "01", title: "Допит Олени Ковальчук", description: "Протокол допиту дружини загиблого. Уважно прочитайте свідчення та зверніть увагу на деталі, які можуть мати значення для розслідування." },
    { id: "dossier", number: "02", title: "Досьє Ігоря Ковальчука", description: "Довідкові відомості про загиблого, які допоможуть краще зрозуміти його життя та обставини, що передували події." },
  ]
  const allRead = documents.every((document) => opened.includes(document.id))

  return (
    <section className="stage-two-screen" aria-label="Етап 2: нові обставини">
      <header className="scene-topline stage-two-topline">
        <span><i /> МАТЕРІАЛИ СПРАВИ</span>
        <span>ЕТАП 02 · СПРАВА № 12026170010000456</span>
      </header>
      {!confirmed ? (
        <div className="stage-two-wrap">
          <div className="narration-kicker"><span>КОНВЕРТ № 2</span><span>НОВІ ОБСТАВИНИ</span></div>
          <h1 className="stage-two-heading">Поглянути ближче</h1>
          <div className="stage-two-assistant">
            <div className="assistant-mark">М</div>
            <div>
              <div className="stage-two-eyebrow">ПОВІДОМЛЕННЯ НАПАРНИКА</div>
              <p>Капітане, поки ми очікуємо на результати призначених експертиз, надійшли матеріали, які можуть допомогти нам краще зрозуміти, ким був Ігор Ковальчук і що відбувалося в його житті напередодні загибелі.</p>
              <p>У конверті два документи: протокол допиту його дружини Олени Ковальчук та досьє на самого Ігоря Ковальчука.</p>
              <p>Пропоную уважно їх вивчити. Звертайте увагу на деталі — навіть те, що на перший погляд здається неважливим, іноді набуває зовсім іншого значення в ході розслідування.</p>
              <button type="button" className="stage-one-secondary" onClick={() => playDialogue(AUDIO_STAGE_TWO_INTRO)}>▶ Прослухати репліку</button>
            </div>
          </div>
          <div className="stage-two-documents">
            {documents.map((document) => {
              const isRead = opened.includes(document.id)
              return (
                <article className={`stage-two-document ${isRead ? "is-read" : ""}`} key={document.id}>
                  <div className="stage-two-document__number">{document.number}</div>
                  <div className="stage-two-document__body">
                    <h2>{document.title}</h2>
                    <p>{document.description}</p>
                    <button type="button" className="stage-one-secondary" onClick={() => setOpened((current) => current.includes(document.id) ? current : [...current, document.id])}>{isRead ? "✓ Документ опрацьовано" : "Позначити як прочитаний"}</button>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="stage-two-footer">
            <button type="button" className="stage-one-secondary" onClick={onBack}>← Повернутися до етапу 1</button>
            <button type="button" className="stage-one-primary" disabled={!allRead} onClick={() => setConfirmed(true)}>Я ознайомився з документами →</button>
          </div>
          {!allRead && <p className="stage-two-hint">Спочатку позначте обидва документи як прочитані.</p>}
        </div>
      ) : (
        <div className="stage-two-wrap stage-two-transition">
          <div className="narration-kicker"><span>ОНОВЛЕННЯ СПРАВИ</span><span>НАДІЙШЛИ НОВІ МАТЕРІАЛИ</span></div>
          <div className="assistant-mark">М</div>
          <h1 className="stage-two-heading">Капітане, є новини</h1>
          <div className="stage-two-assistant stage-two-assistant--single">
            <div>
              <div className="stage-two-eyebrow">ПОВІДОМЛЕННЯ НАПАРНИКА</div>
              <p>Добре, капітане. Тепер у нас є трохи більше інформації про загиблого та його найближче оточення. Але щоб зрозуміти, що насправді сталося тієї ночі, цього недостатньо.</p>
              <p>Нарешті надійшли результати призначених експертиз. Також отримано банківську виписку Ігоря Ковальчука та дані мобільного білінгу.</p>
              <p>Гадаю, тепер у нас з’явиться можливість перевірити деякі обставини й, можливо, виявити нові зачіпки.</p>
              <p>Капітане, відкривайте конверт 3. Думаю, далі буде цікавіше.</p>
              <button type="button" className="stage-one-secondary" onClick={() => playDialogue(AUDIO_STAGE_TWO_NEXT)}>▶ Прослухати репліку</button>
            </div>
          </div>
          <div className="stage-two-footer">
            <button type="button" className="stage-one-secondary" onClick={() => setConfirmed(false)}>← Переглянути документи</button>
            <button type="button" className="stage-one-primary" onClick={onComplete}>Перейти до конверта № 3 →</button>
          </div>
          <p className="stage-two-hint">Конверт № 3 міститиме результати експертиз та отримані інформаційні матеріали.</p>
        </div>
      )}
    </section>
  )
}
