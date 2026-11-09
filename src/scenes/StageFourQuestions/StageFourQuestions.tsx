import { useEffect, useRef, useState } from "react"
import "./StageFourQuestions.css"

type StageFourQuestionsProps = {
  onBack: () => void
}

// Для озвучення потрібен окремий запис репліки Андрія.
// Після додавання файлу в public/audio/ замініть шлях нижче.
const ANDRII_AUDIO = "/audio/assistant-stage-four.mp3"

const DIALOGUE_PARAGRAPHS = [
  "Капітане, поки ми чекаємо на результати експертиз та готуємо додаткові допити, є сенс детально опрацювати матеріали з камер «Відеоконтролю».",
  "Звісно, не факт, що вбивця взагалі засвітився на цих камерах — він міг виїхати через сліпу зону або дачними провулками. Але перевірити ми зобов'язані.",
  "Подивись на всі автомобілі, які перебували в районі дачного масиву у критичний проміжок часу. Проаналізуй їхні маршрути: як вони туди потрапили й як виїжджали, зістав державні номери, колір та тип кузова.",
  "Якщо захочеш дізнатися більше про конкретний автомобіль — у тебе є доступ до Національної інформаційної системи (НАІС МВС). Вводь номерний знак будь-якого авто й перевіряй інформацію з бази даних поліції.",
]

const DESKTOP_AUDIO_DELAY_MS = 2500
const MOBILE_AUDIO_DELAY_MS = 200
const VOICE_VOLUME = 1
const MUSIC_VOLUME_DURING_VOICE = 0.1

function getMusicElement() {
  return document.querySelector(
    'audio[src="/investigation-theme.mp3"]',
  ) as HTMLAudioElement | null
}

export default function StageFourQuestions({
  onBack,
}: StageFourQuestionsProps) {
  const [playingDialogue, setPlayingDialogue] = useState(false)
  const [audioUnavailable, setAudioUnavailable] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousMusicVolumeRef = useRef<number | null>(null)
  const screenRef = useRef<HTMLElement>(null)

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
    const current = audioRef.current
    if (current && !current.paused && !current.ended) return

    stopDialogue()
    const audio = new Audio(ANDRII_AUDIO)
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
    const delay = window.matchMedia("(pointer: coarse)").matches
      ? MOBILE_AUDIO_DELAY_MS
      : DESKTOP_AUDIO_DELAY_MS
    const timer = window.setTimeout(playDialogue, delay)

    return () => {
      window.clearTimeout(timer)
      stopDialogue()
    }
  }, [])

  return (
    <main
      ref={screenRef}
      className="stage-four-questions"
      aria-label="Повідомлення напарника про відеоконтроль"
    >
      <header className="stage-four-questions__topline">
        <span>
          <i /> ПОВІДОМЛЕННЯ ВІД НАПАРНИКА
        </span>
        <span>ЕТАП 04 · СПРАВА № 12026170010000456</span>
      </header>

      <div className="stage-four-questions__wrap">
        <div className="narration-kicker">
          <span>НАПАРНИК · АНДРІЙ</span>
          <span>ПІСЛЯ ОПРАЦЮВАННЯ КОНВЕРТА № 4</span>
        </div>

        <section className="stage-four-questions__card" aria-label="Репліка Андрія">
          <img
            className="stage-four-questions__avatar"
            src="/assistant-mark.png"
            alt=""
            aria-hidden="true"
          />

          <div className="stage-four-questions__content">
            <div className="stage-four-questions__identity">
              <span className="stage-four-questions__eyebrow">НАПАРНИК АНДРІЙ</span>
              <span className="stage-four-questions__subtitle">
                ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ
              </span>
            </div>

            <h1>Відеоконтроль: перевіряємо автомобілі</h1>

            <div className="stage-four-questions__dialogue">
              {DIALOGUE_PARAGRAPHS.map((paragraph, index) => (
                <p key={paragraph} style={{ animationDelay: `${index * 180}ms` }}>
                  {index === 3 ? (
                    <>
                      Якщо захочеш дізнатися більше про конкретний автомобіль — у
                      тебе є доступ до{" "}
                      <strong>Національної інформаційної системи (НАІС МВС)</strong>.
                      Вводь номерний знак будь-якого авто й перевіряй інформацію з
                      бази даних поліції.
                    </>
                  ) : paragraph}
                </p>
              ))}
            </div>

            <div className="stage-four-questions__audio-row">
              <button
                className="stage-one-secondary stage-four-questions__audio"
                type="button"
                onClick={playDialogue}
                disabled={playingDialogue || audioUnavailable}
              >
                {playingDialogue
                  ? "▶ Репліка відтворюється…"
                  : audioUnavailable
                    ? "Аудіозапис ще не додано"
                    : "▶ Прослухати репліку"}
              </button>
              {audioUnavailable && (
                <span className="stage-four-questions__audio-note">
                  Додайте файл assistant-stage-four.mp3 до public/audio/.
                </span>
              )}
            </div>

            <div className="stage-four-questions__actions">
              <button
                className="stage-one-secondary"
                type="button"
                onClick={() => {
                  stopDialogue()
                  onBack()
                }}
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
