import { useEffect, useRef, useState } from "react"
import "./StageFourContinuation.css"

type StageFourContinuationProps = {
  onBack: () => void
  onContinue: () => void
}

const CONTINUATION_AUDIO = "/audio/assistant-stage-four.mp3"
const VOICE_VOLUME = 1
const MUSIC_VOLUME_DURING_VOICE = 0.1

function getMusicElement() {
  return document.querySelector('audio[src="/investigation-theme.mp3"]') as HTMLAudioElement | null
}

export default function StageFourContinuation({ onBack, onContinue }: StageFourContinuationProps) {
  const [playingDialogue, setPlayingDialogue] = useState(false)
  const [audioUnavailable, setAudioUnavailable] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousMusicVolumeRef = useRef<number | null>(null)

  function restoreMusicVolume() {
    const music = getMusicElement()
    if (music && previousMusicVolumeRef.current !== null) {
      music.volume = previousMusicVolumeRef.current
      previousMusicVolumeRef.current = null
    }
  }

  function stopDialogue() {
    const audio = audioRef.current
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
    setPlayingDialogue(false)
    restoreMusicVolume()
  }

  function playDialogue() {
    if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) return
    stopDialogue()

    const audio = new Audio(CONTINUATION_AUDIO)
    audio.preload = "auto"
    audio.volume = VOICE_VOLUME
    audioRef.current = audio

    const music = getMusicElement()
    if (music) {
      previousMusicVolumeRef.current = music.volume
      music.volume = MUSIC_VOLUME_DURING_VOICE
    }

    const finish = () => {
      if (audioRef.current !== audio) return
      audioRef.current = null
      setPlayingDialogue(false)
      restoreMusicVolume()
    }

    audio.onended = finish
    audio.onerror = () => {
      finish()
      setAudioUnavailable(true)
    }

    setAudioUnavailable(false)
    setPlayingDialogue(true)
    void audio.play().catch(() => {
      finish()
      setAudioUnavailable(true)
    })
  }

  useEffect(() => {
    const timer = window.setTimeout(playDialogue, 200)
    return () => {
      window.clearTimeout(timer)
      stopDialogue()
    }
  }, [])

  function goBack() {
    stopDialogue()
    onBack()
  }

  function goToEnvelopeFive() {
    stopDialogue()
    onContinue()
  }

  return (
    <main className="stage-four-continuation" aria-label="Продовження розслідування">
      <header className="stage-four-continuation__topline">
        <span><i /> НОВЕ ПОВІДОМЛЕННЯ ВІД НАПАРНИКА</span>
        <span>ЕТАП 04 · ПРОДОВЖЕННЯ</span>
      </header>

      <div className="stage-four-continuation__wrap">
        <div className="stage-four-continuation__kicker">
          <span>НАПАРНИК · АНДРІЙ</span>
          <span>НАСТУПНИЙ ФРАГМЕНТ СПРАВИ</span>
        </div>

        <section className="stage-four-continuation__card">
          <img className="stage-four-continuation__avatar" src="/assistant-mark.png" alt="" aria-hidden="true" />
          <div className="stage-four-continuation__content">
            <div className="stage-four-continuation__identity">
              <span>НАПАРНИК АНДРІЙ</span>
              <small>ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ</small>
            </div>

            <h1>Є результат. Рухаємося далі.</h1>

            <div className="stage-four-continuation__dialogue">
              <p>Добре. Ти вже перевірив автомобілі та зафіксував процесуальну дію щодо одного з них. Тепер можемо перейти до наступної частини розслідування.</p>
              <p>Далі на нас чекають нові матеріали справи. Переходимо до наступного конверта та подивимося, що вдалося отримати в результаті подальшої роботи.</p>
            </div>

            <div className="stage-four-continuation__audio">
              <button
                className="stage-one-secondary"
                type="button"
                disabled={playingDialogue || audioUnavailable}
                onClick={playDialogue}
              >
                {playingDialogue ? "▶ Репліка відтворюється…" : audioUnavailable ? "Аудіозапис ще не додано" : "▶ Прослухати репліку"}
              </button>
              {audioUnavailable && (
                <span>Тестова репліка використовує assistant-stage-four.mp3. Пізніше сюди можна додати окремий аудіофайл.</span>
              )}
            </div>

            <div className="stage-four-continuation__actions">
              <button className="stage-one-secondary" type="button" onClick={goBack}>
                ← Назад
              </button>
              <button className="stage-four-continuation__next-button" type="button" onClick={goToEnvelopeFive}>
                Переходимо до 5 конверта →
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
