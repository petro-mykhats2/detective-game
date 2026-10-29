import { useEffect, useRef, useState } from "react"

type Props = { onBack: () => void; onComplete: () => void }

const AUDIO_STAGE_TWO_INTRO = "/audio/assistant-stage-two-intro.mp3"
const AUDIO_STAGE_TWO_NEXT = "/audio/assistant-stage-two-next.mp3"

// ПАУЗИ ПЕРЕД АВТОВІДТВОРЕННЯМ (мс): окремо для комп’ютерів і мобільних пристроїв.
// На комп’ютері 2500 = 2,5 секунди для атмосфери.
// На мобільних 200 = 0,2 секунди: довший таймер може втратити дозвіл autoplay браузера.
// Можна змінювати ці значення окремо для вступної репліки та репліки з новинами.
const STAGE_TWO_INTRO_DELAY_DESKTOP_MS = 2500
const STAGE_TWO_NEXT_DELAY_DESKTOP_MS = 2500
const STAGE_TWO_INTRO_DELAY_MOBILE_MS = 200
const STAGE_TWO_NEXT_DELAY_MOBILE_MS = 200

function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches
}

// НАЛАШТУВАННЯ ГУЧНОСТІ (від 0 до 1):
// STAGE_TWO_VOICE_VOLUME — гучність голосу напарника.
// STAGE_TWO_MUSIC_VOLUME_DURING_VOICE — гучність фонової музики під час репліки.
const STAGE_TWO_VOICE_VOLUME = 1
const STAGE_TWO_MUSIC_VOLUME_DURING_VOICE = 0.10

function preloadDialogue(path: string) {
  const audio = new Audio()
  audio.preload = "auto"
  audio.src = path
  audio.load()
}

export default function StageTwo({ onBack, onComplete }: Props) {
  const [opened, setOpened] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const transitionTimer = useRef<number | null>(null)
  const screenRef = useRef<HTMLElement>(null)
  const introAudioRef = useRef<HTMLAudioElement | null>(null)
  const nextAudioRef = useRef<HTMLAudioElement | null>(null)
  const [playingDialogue, setPlayingDialogue] = useState(false)
  const musicVolumeBeforeVoiceRef = useRef<number | null>(null)
  const autoNextStartedRef = useRef(false)

  function getMusicElement() {
    // App.tsx містить один постійний елемент <audio> для фонової музики.
    return document.querySelector('audio[src="/investigation-theme.mp3"]') as HTMLAudioElement | null
  }

  function restoreMusicVolume() {
    const music = getMusicElement()
    if (music && musicVolumeBeforeVoiceRef.current !== null) {
      music.volume = musicVolumeBeforeVoiceRef.current
      musicVolumeBeforeVoiceRef.current = null
    }
  }

  function stopDialogue() {
    ;[introAudioRef.current, nextAudioRef.current].forEach((audio) => {
      if (audio) {
        audio.onended = null
        audio.onerror = null
        audio.pause()
        audio.currentTime = 0
      }
    })
    introAudioRef.current = null
    nextAudioRef.current = null
    setPlayingDialogue(false)
    restoreMusicVolume()
  }

  function playDialogue(path: string) {
    // Не запускаємо повторно, якщо репліка вже грає.
    const current = path === AUDIO_STAGE_TWO_INTRO ? introAudioRef.current : nextAudioRef.current
    if (current && !current.paused && !current.ended) return
    stopDialogue()
    const audio = new Audio(path)
    audio.preload = "auto"
    audio.volume = STAGE_TWO_VOICE_VOLUME
    if (path === AUDIO_STAGE_TWO_INTRO) introAudioRef.current = audio
    else nextAudioRef.current = audio

    const music = getMusicElement()
    if (music) {
      musicVolumeBeforeVoiceRef.current = music.volume
      music.volume = STAGE_TWO_MUSIC_VOLUME_DURING_VOICE
    }
    const finish = () => {
      if (path === AUDIO_STAGE_TWO_INTRO && introAudioRef.current !== audio) return
      if (path === AUDIO_STAGE_TWO_NEXT && nextAudioRef.current !== audio) return
      if (path === AUDIO_STAGE_TWO_INTRO) introAudioRef.current = null
      else nextAudioRef.current = null
      setPlayingDialogue(false)
      restoreMusicVolume()
    }
    audio.onended = finish
    audio.onerror = finish
    setPlayingDialogue(true)
    void audio.play().catch(finish)
  }

  useEffect(() => {
    preloadDialogue(AUDIO_STAGE_TWO_INTRO)
    preloadDialogue(AUDIO_STAGE_TWO_NEXT)

    // Як у вікні підсумку першого етапу: запускаємо озвучку через таймер після появи екрана.
    // Якщо браузер блокує autoplay, кнопка ручного запуску залишається доступною.
    const introDelay = isTouchDevice() ? STAGE_TWO_INTRO_DELAY_MOBILE_MS : STAGE_TWO_INTRO_DELAY_DESKTOP_MS
    const timerId = window.setTimeout(() => playDialogue(AUDIO_STAGE_TWO_INTRO), introDelay)
    return () => {
      window.clearTimeout(timerId)
      stopDialogue()
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
    }
  }, [])

  useEffect(() => {
    // Автоматична репліка для екрана новин запускається один раз після переходу на нього.
    if (confirmed && !autoNextStartedRef.current) {
      autoNextStartedRef.current = true
      const nextDelay = isTouchDevice() ? STAGE_TWO_NEXT_DELAY_MOBILE_MS : STAGE_TWO_NEXT_DELAY_DESKTOP_MS
      const timerId = window.setTimeout(() => playDialogue(AUDIO_STAGE_TWO_NEXT), nextDelay)
      return () => window.clearTimeout(timerId)
    }
    if (!confirmed) autoNextStartedRef.current = false
  }, [confirmed])

  function scrollStageToTop() {
    window.scrollTo({ top: 0, behavior: "auto" })
    if (screenRef.current) screenRef.current.scrollTop = 0
  }

  function confirmDocuments() {
    if (!allRead || transitioning) return
    stopDialogue()
    setTransitioning(true)
    transitionTimer.current = window.setTimeout(() => {
      setConfirmed(true)
      requestAnimationFrame(() => {
        scrollStageToTop()
        window.setTimeout(() => setTransitioning(false), 650)
      })
      transitionTimer.current = null
    }, 320)
  }

  function continueToEnvelopeThree() {
    if (transitioning) return
    stopDialogue()
    setTransitioning(true)
    transitionTimer.current = window.setTimeout(() => {
      onComplete()
      transitionTimer.current = null
    }, 320)
  }
  const documents = [
    { id: "wife", number: "01", title: "Допит Олени Ковальчук", description: "Протокол допиту дружини загиблого. Уважно прочитайте свідчення та зверніть увагу на деталі, які можуть мати значення для розслідування." },
    { id: "dossier", number: "02", title: "Досьє Ігоря Ковальчука", description: "Довідкові відомості про загиблого, які допоможуть краще зрозуміти його життя та обставини, що передували події." },
  ]
  const allRead = documents.every((document) => opened.includes(document.id))

  return (
    <section ref={screenRef} className={`stage-two-screen${transitioning ? " is-transitioning" : ""}`} aria-label="Етап 2: нові обставини">
      <header className="scene-topline stage-two-topline">
        <span><i /> МАТЕРІАЛИ СПРАВИ</span>
        <span>ЕТАП 02 · СПРАВА № 12026170010000456</span>
      </header>
      {!confirmed ? (
        <div className="stage-two-wrap">
          <div className="narration-kicker"><span>КОНВЕРТ № 2</span><span>НОВІ ОБСТАВИНИ</span></div>
          <h1 className="stage-two-heading">Поглянути ближче</h1>
          <section className="stage-two-assistant" aria-label="Повідомлення напарника">
            <div className="assistant-mark" aria-hidden="true">М</div>
            <div className="stage-two-assistant__message">
              <div className="stage-two-assistant__identity">
                <div><div className="stage-two-eyebrow">НАПАРНИК</div><div className="stage-two-assistant__subtitle">ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ</div></div>
              </div>
              <div className="stage-two-assistant__text">
                <p>Капітане, поки ми очікуємо на результати призначених експертиз, надійшли матеріали, які можуть допомогти нам краще зрозуміти, ким був Ігор Ковальчук і що відбувалося в його житті напередодні загибелі.</p>
                <p>У конверті два документи: протокол допиту його дружини Олени Ковальчук та досьє на самого Ігоря Ковальчука.</p>
                <p>Пропоную уважно їх вивчити. Звертайте увагу на деталі — навіть те, що на перший погляд здається неважливим, іноді набуває зовсім іншого значення в ході розслідування.</p>
              </div>
              <button type="button" className="stage-one-secondary stage-two-assistant__audio" disabled={playingDialogue} onClick={() => playDialogue(AUDIO_STAGE_TWO_INTRO)}>{playingDialogue ? "▶ Репліка відтворюється…" : "▶ Прослухати репліку"}</button>
            </div>
          </section>
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
            <button type="button" className="stage-one-secondary" onClick={() => { stopDialogue(); onBack() }}>← Повернутися до етапу 1</button>
            <button type="button" className="stage-one-primary" disabled={!allRead} onClick={confirmDocuments}>Я ознайомився з документами →</button>
          </div>
          {!allRead && <p className="stage-two-hint">Спочатку позначте обидва документи як прочитані.</p>}
        </div>
      ) : (
        <div className="stage-two-wrap stage-two-transition">
          <div className="narration-kicker"><span>ОНОВЛЕННЯ СПРАВИ</span><span>НАДІЙШЛИ НОВІ МАТЕРІАЛИ</span></div>
          <h1 className="stage-two-heading">Капітане, є новини</h1>
          <section className="stage-two-assistant stage-two-assistant--single" aria-label="Повідомлення напарника">
            <div className="assistant-mark" aria-hidden="true">М</div>
            <div className="stage-two-assistant__message">
              <div className="stage-two-assistant__identity"><div><div className="stage-two-eyebrow">НАПАРНИК</div><div className="stage-two-assistant__subtitle">ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ</div></div></div>
              <div className="stage-two-assistant__text">
                <p>Добре, капітане. Тепер у нас є трохи більше інформації про загиблого та його найближче оточення. Але щоб зрозуміти, що насправді сталося тієї ночі, цього недостатньо.</p>
                <p>Нарешті надійшли результати призначених експертиз. Також отримано банківську виписку Ігоря Ковальчука та дані мобільного білінгу.</p>
                <p>Гадаю, тепер у нас з’явиться можливість перевірити деякі обставини й, можливо, виявити нові зачіпки.</p>
                <p>Капітане, відкривайте конверт 3. Думаю, далі буде цікавіше.</p>
              </div>
              <button type="button" className="stage-one-secondary stage-two-assistant__audio" disabled={playingDialogue} onClick={() => playDialogue(AUDIO_STAGE_TWO_NEXT)}>{playingDialogue ? "▶ Репліка відтворюється…" : "▶ Прослухати репліку"}</button>
            </div>
          </section>
          <div className="stage-two-footer">
            <button type="button" className="stage-one-secondary" onClick={() => { stopDialogue(); setConfirmed(false) }}>← Переглянути документи</button>
            <button type="button" className="stage-one-primary" onClick={continueToEnvelopeThree}>Перейти до конверта № 3 →</button>
          </div>
          <p className="stage-two-hint">Конверт № 3 міститиме результати експертиз та отримані інформаційні матеріали.</p>
        </div>
      )}
    </section>
  )
}
