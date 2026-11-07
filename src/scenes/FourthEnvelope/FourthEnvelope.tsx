import { useEffect, useRef, useState } from "react"
import "./FourthEnvelope.css"

const AUDIO_FOURTH_ENVELOPE = "/audio/assistant-stage-two-next.mp3"

const FOURTH_ENVELOPE_AUDIO_DELAY_DESKTOP_MS = 2500
const FOURTH_ENVELOPE_AUDIO_DELAY_MOBILE_MS = 200
const FOURTH_ENVELOPE_VOICE_VOLUME = 1
const FOURTH_ENVELOPE_MUSIC_VOLUME_DURING_VOICE = 0.1

function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches
}

function preloadDialogue(path: string) {
  const audio = new Audio()
  audio.preload = "auto"
  audio.src = path
  audio.load()
}

export default function FourthEnvelope() {
  const [playingDialogue, setPlayingDialogue] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const musicVolumeBeforeVoiceRef = useRef<number | null>(null)

  function getMusicElement() {
    return document.querySelector(
      'audio[src="/investigation-theme.mp3"]',
    ) as HTMLAudioElement | null
  }

  function restoreMusicVolume() {
    const music = getMusicElement()
    if (music && musicVolumeBeforeVoiceRef.current !== null) {
      music.volume = musicVolumeBeforeVoiceRef.current
      musicVolumeBeforeVoiceRef.current = null
    }
  }

  function stopDialogue() {
    const audio = audioRef.current
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.pause()
      audio.currentTime = 0
    }
    audioRef.current = null
    setPlayingDialogue(false)
    restoreMusicVolume()
  }

  function playDialogue() {
    const current = audioRef.current
    if (current && !current.paused && !current.ended) return

    stopDialogue()

    const audio = new Audio(AUDIO_FOURTH_ENVELOPE)
    audio.preload = "auto"
    audio.volume = FOURTH_ENVELOPE_VOICE_VOLUME
    audioRef.current = audio

    const music = getMusicElement()
    if (music) {
      musicVolumeBeforeVoiceRef.current = music.volume
      music.volume = FOURTH_ENVELOPE_MUSIC_VOLUME_DURING_VOICE
    }

    const finish = () => {
      if (audioRef.current !== audio) return
      audioRef.current = null
      setPlayingDialogue(false)
      restoreMusicVolume()
    }

    audio.onended = finish
    audio.onerror = finish
    setPlayingDialogue(true)
    void audio.play().catch(finish)
  }

  useEffect(() => {
    preloadDialogue(AUDIO_FOURTH_ENVELOPE)

    const delay = isTouchDevice()
      ? FOURTH_ENVELOPE_AUDIO_DELAY_MOBILE_MS
      : FOURTH_ENVELOPE_AUDIO_DELAY_DESKTOP_MS

    const timerId = window.setTimeout(playDialogue, delay)

    return () => {
      window.clearTimeout(timerId)
      stopDialogue()
    }
  }, [])

  return (
    <main className="fourth-envelope" aria-label="Конверт 4">
      <div className="fourth-envelope__wrap">
        <div className="fourth-envelope__top">
          <span>
            <i /> ПОВІДОМЛЕННЯ ВІД НАПАРНИКА
          </span>
          <span>ЕТАП 04 · КОНВЕРТ 04</span>
        </div>

        <div className="fourth-envelope__wrap-inner">
          <div className="narration-kicker">
            <span>НАПАРНИК · АНДРІЙ</span>
            <span>КОНВЕРТ № 4</span>
          </div>

          <h1 className="fourth-envelope__heading">Є нові матеріали</h1>

          <section
            className="fourth-envelope__assistant"
            aria-label="Повідомлення напарника"
          >
            <img
              className="assistant-mark"
              aria-hidden="true"
              src="/assistant-mark.png"
            />

            <div className="fourth-envelope__message">
              <div className="fourth-envelope__identity">
                <div>
                  <div className="fourth-envelope__eyebrow">
                    напарник Андрій
                  </div>
                  <div className="fourth-envelope__subtitle">
                    ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ
                  </div>
                </div>
              </div>

              <div className="fourth-envelope__text">
                <p>
                  Ну що, капітане, зібрав майже все, що ти замовляв. Тримай
                  четвертий конверт — тут ціла купа матеріалів: протоколи
                  допитів, витяги, ухвали...
                </p>
                <p>Коротше, є над чим поламати голову. Розбирайся!</p>
              </div>

              <button
                type="button"
                className="stage-one-secondary fourth-envelope__audio"
                disabled={playingDialogue}
                onClick={playDialogue}
              >
                {playingDialogue
                  ? "▶ Репліка відтворюється…"
                  : "▶ Прослухати репліку знову"}
              </button>
            </div>
          </section>

          <div className="fourth-envelope__actions">
            <button
              className="stage-one-secondary"
              type="button"
              onClick={() => {}}
            >
              Запросити інші матеріали
            </button>
            <button
              className="stage-one-primary"
              type="button"
              onClick={() => {}}
            >
              Допоможеш розібратись, напарнику
            </button>
          </div>
        </div>

        <footer className="fourth-envelope__footer">
          <span>КРИМІНАЛЬНЕ ПРОВАДЖЕННЯ № 12026170010000456</span>
          <span>КОНВЕРТ 04</span>
        </footer>
      </div>
    </main>
  )
}
