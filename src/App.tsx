import { useEffect, useRef, useState } from "react"
import "./App.css"

type Scene = "intro" | "investigation"

// Поклади свої файли в public/ з цими назвами або зміни шляхи тут.
const BACKGROUND_IMAGE = "/background.jpeg"
const MUSIC_FILE = "/investigation-theme.mp3"
// Коли підготуєш озвучений вступ, вкажи тут шлях, наприклад "/dialogue-intro.mp3".
const INTRO_DIALOGUE_FILE = ""

export default function App() {
  const [scene, setScene] = useState<Scene>("intro")
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [audioBlocked, setAudioBlocked] = useState(false)
  const [ready, setReady] = useState(false)
  const musicRef = useRef<HTMLAudioElement>(null)
  const dialogueRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Даємо фоновому зображенню завантажитися до початку анімації.
    const image = new Image()
    image.src = BACKGROUND_IMAGE
    image.onload = () => setReady(true)
    image.onerror = () => setReady(true) // не блокуємо вступ, якщо файл ще не доданий

    // Браузер може заборонити звук до першої взаємодії користувача.
    const music = musicRef.current
    if (music && musicEnabled) {
      void music
        .play()
        .then(() => setAudioBlocked(false))
        .catch(() => setAudioBlocked(true))
    }
  }, [])

  useEffect(() => {
    const music = musicRef.current
    if (!music) return

    if (musicEnabled) {
      void music
        .play()
        .then(() => setAudioBlocked(false))
        .catch(() => setAudioBlocked(true))
    } else {
      music.pause()
      setAudioBlocked(false)
    }
  }, [musicEnabled])

  async function startInvestigation() {
    // Клік користувача дозволяє браузеру почати відтворення аудіо.
    if (musicEnabled && musicRef.current) {
      try {
        await musicRef.current.play()
        setAudioBlocked(false)
      } catch {
        setAudioBlocked(true)
      }
    }

    setScene("investigation")

    if (INTRO_DIALOGUE_FILE && dialogueRef.current) {
      dialogueRef.current.currentTime = 0
      void dialogueRef.current.play().catch(() => {
        // Озвучення можна запустити пізніше після додавання файлу до public/.
      })
    }
  }

  async function toggleMusic() {
    if (!musicEnabled && musicRef.current) {
      try {
        await musicRef.current.play()
        setAudioBlocked(false)
        setMusicEnabled(true)
      } catch {
        setAudioBlocked(true)
      }
      return
    }
    setMusicEnabled(false)
  }

  return (
    <main
      className={`experience experience--${scene} ${ready ? "is-ready" : ""}`}
    >
      <div
        className="experience__background"
        style={{ backgroundImage: `url("${BACKGROUND_IMAGE}")` }}
        aria-hidden="true"
      />
      <div className="experience__shade" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />

      {scene === "intro" ? (
        <section className="intro" aria-label="Початок гри">
          <div className="intro__classification">
            КРИМІНАЛЬНЕ РОЗСЛІДУВАННЯ <span>///</span> ДОСЬЄ № 001
          </div>
          <div className="intro__center">
            <div className="intro__overline">
              <span /> КОЖНА ДЕТАЛЬ МАЄ ЗНАЧЕННЯ
            </div>
            <h1 className="intro__title">
              Детектив<span>.</span>
            </h1>
            <p className="intro__subtitle">Істина прихована в деталях.</p>
            <button className="start-button" onClick={startInvestigation}>
              <span>Почати розслідування</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="intro__footer">
            <span>СИСТЕМА ГОТОВА ДО РОБОТИ</span>
            <span className="intro__footer-mark">
              <i /> CASE FILE / 001
            </span>
          </div>
        </section>
      ) : (
        <section className="investigation" aria-label="Початок розслідування">
          <div className="investigation__topline">
            <span>
              <i /> РОЗСЛІДУВАННЯ РОЗПОЧАТО
            </span>
            <span>ДОСЬЄ № 001</span>
          </div>
          <div className="investigation__message" key="investigation-message">
            <span className="investigation__rule" />
            <p>У кожної справи є своя історія.</p>
          </div>
        </section>
      )}

      <button
        className={`sound-toggle ${musicEnabled ? "is-on" : "is-off"}`}
        onClick={toggleMusic}
        aria-label={
          musicEnabled ? "Вимкнути фонову музику" : "Увімкнути фонову музику"
        }
        title={
          audioBlocked && musicEnabled
            ? "Натисни, щоб дозволити відтворення музики"
            : musicEnabled
              ? "Вимкнути музику"
              : "Увімкнути музику"
        }
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4Z" />
          {musicEnabled ? (
            <>
              <path d="M16 9a4 4 0 0 1 0 6" />
              <path d="M18.5 6.5a8 8 0 0 1 0 11" />
            </>
          ) : (
            <path d="m16 9 5 6m0-6-5 6" />
          )}
        </svg>
        <span>
          {audioBlocked && musicEnabled
            ? "УВІМКНУТИ ЗВУК"
            : musicEnabled
              ? "ЗВУК УВІМКНЕНО"
              : "ЗВУК ВИМКНЕНО"}
        </span>
      </button>

      <audio ref={musicRef} src={MUSIC_FILE} loop preload="auto" />
      {INTRO_DIALOGUE_FILE ? (
        <audio ref={dialogueRef} src={INTRO_DIALOGUE_FILE} preload="auto" />
      ) : null}
    </main>
  )
}
