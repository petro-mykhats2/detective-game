import { useCallback, useEffect, useRef, useState } from "react"
import "./ChiefBriefing.css"

type Props = { onContinue: () => void }

type PlaybackState = "ready" | "playing" | "finished" | "unavailable"

// PLACEHOLDER: замініть ці шляхи на власні файли в папці public.
// Голос начальника — окремий файл, без вбудованих субтитрів.
const CHIEF_VOICE_FILE = "/audio/chief-briefing-voice.mp3"
// Нова фонова атмосфера саме для кабінету начальника; файл має повторюватися.
const OFFICE_AMBIENCE_FILE = "/audio/chief-office-ambience.mp3"

// Гучність фонового аудіо до/після промови та під час голосу.
const AMBIENCE_VOLUME_NORMAL = 0.24
const AMBIENCE_VOLUME_DURING_VOICE = 0.055
const CHIEF_VOICE_VOLUME = 1

const dialogue = [
  { text: "Бачу, ти вже отримав висновки експертів і первинні матеріали.", cue: "ВИМОГА НАЧАЛЬНИКА" },
  { text: "Добре. Тепер уважно вивчи все, що маєш.", cue: "УВАЖНО ВИВЧИ МАТЕРІАЛИ" },
  { text: "На мене тиснуть згори. Журналісти телефонують щодня. Усі хочуть знати, що сталося. Чому загинула людина? Чи справді це звичайна дорожньо-транспортна пригода?", cue: "ТИСК ЗГОРИ" },
  { text: "Мені потрібні не здогадки. Не припущення. Мені потрібні факти.", cue: "ПОТРІБНІ ФАКТИ" },
  { text: "Перевір експертизи. Зістав їх із матеріалами справи. Якщо побачиш обставини, які не узгоджуються з версією ДТП і можуть указувати на умисне вбивство, доповідай негайно.", cue: "ПЕРЕВІР КОЖНУ ДЕТАЛЬ" },
  { text: "Тоді розглянемо питання про зміну правової кваліфікації та залучення додаткових сил до розслідування. Але спочатку ти маєш обґрунтувати своє рішення.", cue: "РІШЕННЯ МАЄ БУТИ ОБҐРУНТОВАНЕ" },
  { text: "До вечора чекаю від тебе попередній звіт. Не поспішай із висновками… але й не пропусти нічого важливого. Якщо це не просто ДТП — ми повинні це встановити.", cue: "ЗВІТ ДО ВЕЧОРА" },
]

export default function ChiefBriefing({ onContinue }: Props) {
  const ambienceRef = useRef<HTMLAudioElement>(null)
  const voiceRef = useRef<HTMLAudioElement>(null)
  const voiceLockedRef = useRef(false)
  const autoplayTimerRef = useRef<number | null>(null)
  const fadeFrameRef = useRef<number | null>(null)
  const [playback, setPlayback] = useState<PlaybackState>("ready")
  const [activeLine, setActiveLine] = useState(0)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)

  // Плавна зміна гучності без різких стартів/зупинок.
  const fadeVolume = useCallback((
    audio: HTMLAudioElement,
    target: number,
    duration = 1200,
  ) => {
    if (fadeFrameRef.current !== null) cancelAnimationFrame(fadeFrameRef.current)
    const from = audio.volume
    const startedAt = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      // Ease-in-out: м'який початок і завершення.
      const eased = progress * progress * (3 - 2 * progress)
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * eased))
      if (progress < 1) fadeFrameRef.current = requestAnimationFrame(tick)
      else fadeFrameRef.current = null
    }
    fadeFrameRef.current = requestAnimationFrame(tick)
  }, [])

  const restoreAmbience = useCallback(() => {
    const ambience = ambienceRef.current
    if (ambience) fadeVolume(ambience, AMBIENCE_VOLUME_NORMAL, 1400)
  }, [fadeVolume])

  const stopAllAudio = useCallback(() => {
    if (autoplayTimerRef.current !== null) {
      window.clearTimeout(autoplayTimerRef.current)
      autoplayTimerRef.current = null
    }
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current)
      fadeFrameRef.current = null
    }
    const voice = voiceRef.current
    const ambience = ambienceRef.current
    if (voice) {
      voice.pause()
      voice.currentTime = 0
      voice.volume = 0
    }
    voiceLockedRef.current = false
    if (ambience) {
      ambience.pause()
      ambience.currentTime = 0
      ambience.volume = 0
    }
  }, [])

  async function startBriefing() {
    const voice = voiceRef.current
    const ambience = ambienceRef.current
    if (!voice || voiceLockedRef.current || playback === "playing") return
    voiceLockedRef.current = true
    setAutoplayBlocked(false)
    setActiveLine(0)

    voice.pause()
    voice.currentTime = 0
    voice.volume = 0

    if (ambience && ambience.paused) {
      ambience.volume = 0
      try {
        await ambience.play()
        fadeVolume(ambience, AMBIENCE_VOLUME_DURING_VOICE, 900)
      } catch {
        // Голос усе одно можна відтворити, навіть якщо браузер заблокував атмосферу.
      }
    } else if (ambience) {
      fadeVolume(ambience, AMBIENCE_VOLUME_DURING_VOICE, 900)
    }

    try {
      await voice.play()
      setPlayback("playing")
      fadeVolume(voice, CHIEF_VOICE_VOLUME, 1300)
    } catch {
      voiceLockedRef.current = false
      restoreAmbience()
      setPlayback("unavailable")
      setAutoplayBlocked(true)
    }
  }

  // Атмосфера запускається відразу після появи сцени.
  // Голос начальника стартує автоматично через 2 секунди.
  // Якщо браузер заборонить autoplay зі звуком, показуємо кнопку ручного запуску.
  useEffect(() => {
    let cancelled = false
    const ambience = ambienceRef.current

    const beginSceneAudio = async () => {
      if (ambience) {
        ambience.volume = 0
        try {
          await ambience.play()
          if (cancelled) return
          fadeVolume(ambience, AMBIENCE_VOLUME_NORMAL, 1800)
        } catch {
          if (!cancelled) setAutoplayBlocked(true)
        }
      }

      autoplayTimerRef.current = window.setTimeout(() => {
        if (!cancelled) void startBriefing()
      }, 2000)
    }

    void beginSceneAudio()

    return () => {
      cancelled = true
      stopAllAudio()
    }
  // startBriefing uses current refs/state only for this initial scene entry.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fadeVolume, stopAllAudio])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllAudio()
        setPlayback((current) => current === "playing" ? "ready" : current)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [stopAllAudio])

  // Оцінюємо позицію голосу відносно довжини файлу й показуємо субтитри по черзі.
  // Це приблизна синхронізація; для ідеального збігу можна буде додати таймкоди.
  useEffect(() => {
    const voice = voiceRef.current
    if (!voice) return

    const updateLine = () => {
      if (!voice.duration || !Number.isFinite(voice.duration)) return
      const progress = voice.currentTime / voice.duration
      const index = Math.min(dialogue.length - 1, Math.floor(progress * dialogue.length))
      setActiveLine(index)
    }

    voice.addEventListener("timeupdate", updateLine)
    return () => voice.removeEventListener("timeupdate", updateLine)
  }, [])

  function handleVoiceEnded() {
    voiceLockedRef.current = false
    setPlayback("finished")
    setActiveLine(dialogue.length - 1)
    restoreAmbience()
  }

  function handleContinue() {
    stopAllAudio()
    onContinue()
  }

  return (
    <main className="chief-briefing" aria-label="Брифінг начальника слідчого підрозділу">
      <div className="chief-briefing__vignette" aria-hidden="true" />
      <div className="chief-briefing__grain" aria-hidden="true" />

      <header className="chief-briefing__topline">
        <span><i /> СЛУЖБОВИЙ БРИФІНГ</span>
        <span>ПРОВАДЖЕННЯ № 12026170010000456</span>
      </header>

      <section className="chief-briefing__scene">
        <div className="chief-briefing__portrait-wrap">
          {/* PLACEHOLDER ДЛЯ ФОТО: покладіть фото в public/images/chief-office.jpg.
              Якщо файлу ще немає, стилізована заглушка збереже композицію сцени. */}
          <img
            className="chief-briefing__portrait"
            src="/images/chief-office.jpg"
            alt="Начальник слідчого підрозділу за робочим столом"
            onError={(event) => {
              event.currentTarget.style.display = "none"
              event.currentTarget.parentElement?.classList.add("is-placeholder")
            }}
          />
          <div className="chief-briefing__portrait-placeholder" aria-hidden="true">
            <div className="chief-briefing__window-glow" />
            <div className="chief-briefing__desk" />
            <div className="chief-briefing__silhouette">
              <span className="chief-briefing__head" />
              <span className="chief-briefing__body" />
            </div>
            <span className="chief-briefing__placeholder-label">ЗОБРАЖЕННЯ НАЧАЛЬНИКА · PLACEHOLDER</span>
          </div>
          <div className="chief-briefing__portrait-shade" />
          <div className="chief-briefing__identity">
            <span>НАЧАЛЬНИК СЛІДЧОГО ПІДРОЗДІЛУ</span>
            <strong>СЛУЖБОВА НАРАДА</strong>
          </div>
          <div className="chief-briefing__recording"><i /> ЗВ'ЯЗОК ВІДКРИТО</div>
        </div>

        <div className="chief-briefing__dialogue">
          <div className="chief-briefing__eyebrow"><span>03</span> / ТРЕТІЙ КОНВЕРТ</div>
          <h1>Мені потрібні <em>факти.</em></h1>
          <p className="chief-briefing__lead">
            Начальник слідчого підрозділу вимагає попередній звіт до кінця дня.
          </p>

          <div className="chief-briefing__voice-status" aria-live="polite">
            <span className={playback === "playing" ? "is-active" : ""}>
              {playback === "playing" ? "ЗАРАЗ ГОВОРИТЬ НАЧАЛЬНИК" :
                playback === "finished" ? "БРИФІНГ ЗАВЕРШЕНО" :
                playback === "unavailable" ? "АУДІО НЕ ЗНАЙДЕНО — ДОСТУПНИЙ ТЕКСТ" :
                "ЗВЕРНЕННЯ НАЧАЛЬНИКА"}
            </span>
            <div className={playback === "playing" ? "chief-briefing__sound-bars is-playing" : "chief-briefing__sound-bars"} aria-hidden="true">
              {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 45}ms` }} />)}
            </div>
          </div>

          <div className="chief-briefing__subtitle" key={activeLine}>
            <span>{dialogue[activeLine].cue}</span>
            <p>{dialogue[activeLine].text}</p>
          </div>

          <div className="chief-briefing__transcript">
            <span className="chief-briefing__transcript-label">ЗМІСТ ЗВЕРНЕННЯ</span>
            {dialogue.map((line, index) => (
              <p className={index === activeLine && playback === "playing" ? "is-current" : ""} key={line.cue}>
                {line.text}
              </p>
            ))}
          </div>

          <div className="chief-briefing__controls">
            {(playback === "unavailable" || autoplayBlocked) && playback !== "playing" && playback !== "finished" && (
              <button className="chief-briefing__primary" onClick={startBriefing}>
                <span className="chief-briefing__play-icon">▶</span>
                "Увімкнути звук"
              </button>
            )}
            {playback === "playing" && (
              <span className="chief-briefing__playing-note">Промова триває. Повторне відтворення заблоковано.</span>
            )}
            {playback === "finished" && (
              <p className="chief-briefing__afterword">Рішення за вами. Уважно вивчіть матеріали третього конверта.</p>
            )}
            <button className="chief-briefing__continue" onClick={handleContinue}>
              Перейти до матеріалів <span aria-hidden="true">↗</span>
            </button>
          </div>

          {autoplayBlocked && playback !== "playing" && (
            <p className="chief-briefing__audio-note">Браузер заблокував автоматичне відтворення. Натисніть «Увімкнути звук».</p>
          )}
        </div>
      </section>

      <footer className="chief-briefing__footer">
        <span>ВНУТРІШНЄ КОРИСТУВАННЯ</span>
        <span>КОНВЕРТ 03 · ПОПЕРЕДНІЙ АНАЛІЗ</span>
      </footer>

      {/* Окремі аудіоелементи: замініть файли, не вбудовуйте звук у зображення. */}
      <audio ref={ambienceRef} src={OFFICE_AMBIENCE_FILE} loop preload="auto" />
      <audio
        ref={voiceRef}
        src={CHIEF_VOICE_FILE}
        preload="auto"
        onEnded={handleVoiceEnded}
        onError={() => {
          restoreAmbience()
          setPlayback("unavailable")
        }}
      />
    </main>
  )
}
