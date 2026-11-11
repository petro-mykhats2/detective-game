import { useEffect, useRef, useState } from "react"
import { useVehicleSearch } from "../../components/VehicleSearch/VehicleSearchContext"
import { useInvestigatorNotebook } from "../../components/InvestigatorNotebook/InvestigatorNotebookContext"
import "./StageFourQuestions.css"

type StageFourQuestionsProps = {
  onBack: () => void
  onContinue: () => void
}

const ANDRII_AUDIO = "/audio/assistant-stage-four.mp3"
const DESKTOP_AUDIO_DELAY_MS = 2500
const MOBILE_AUDIO_DELAY_MS = 200
const VOICE_VOLUME = 1
const MUSIC_VOLUME_DURING_VOICE = 0.1

function getMusicElement() {
  return document.querySelector('audio[src="/investigation-theme.mp3"]') as HTMLAudioElement | null
}

export default function StageFourQuestions({ onBack, onContinue }: StageFourQuestionsProps) {
  const [playingDialogue, setPlayingDialogue] = useState(false)
  const [audioUnavailable, setAudioUnavailable] = useState(false)
  const { openVehicleSearch } = useVehicleSearch()
  const { notes } = useInvestigatorNotebook()
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

  const hasVehicleAction = notes.some((note) => {
    if (note.action === "interrogate" || note.action === "suspicion") {
      return Boolean(note.plate)
    }

    const text = `${note.title} ${note.details ?? ""} ${note.source ?? ""}`.toLowerCase()
    return (
      Boolean(note.plate) &&
      (text.includes("заплановано допит") ||
        text.includes("клопотання про підозру"))
    )
  })

  function playDialogue() {
    if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) return
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

  function handleContinue() {
    stopDialogue()
    onContinue()
  }

  return (
    <main className="stage-four-questions" aria-label="Повідомлення напарника про відеоконтроль">
      <header className="stage-four-questions__topline">
        <span><i /> ПОВІДОМЛЕННЯ ВІД НАПАРНИКА</span>
        <span>ЕТАП 04 · СПРАВА № 12026170010000456</span>
      </header>

      <div className="stage-four-questions__wrap">
        <div className="narration-kicker">
          <span>НАПАРНИК · АНДРІЙ</span>
          <span>ПІСЛЯ ОПРАЦЮВАННЯ КОНВЕРТА № 4</span>
        </div>

        <section className="stage-four-questions__card" aria-label="Репліка Андрія">
          <img className="stage-four-questions__avatar" src="/assistant-mark.png" alt="" aria-hidden="true" />
          <div className="stage-four-questions__content">
            <div className="stage-four-questions__identity">
              <span className="stage-four-questions__eyebrow">НАПАРНИК АНДРІЙ</span>
              <span className="stage-four-questions__subtitle">ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ</span>
            </div>
            <h1>Відеоконтроль: перевіряємо автомобілі</h1>

            <div className="stage-four-questions__dialogue">
              <p>Капітане, поки ми чекаємо на результати експертиз та готуємо додаткові допити, є сенс детально опрацювати матеріали з камер «Відеоконтролю».</p>
              <p>Звісно, не факт, що вбивця взагалі засвітився на цих камерах — він міг виїхати через сліпу зону або дачними провулками. Але перевірити ми зобов'язані.</p>
              <p>Подивись на всі автомобілі, які перебували в районі дачного масиву у критичний проміжок часу. Проаналізуй їхні маршрути: як вони туди потрапили й як виїжджали, зістав державні номери, колір та тип кузова.</p>
              <p>Якщо захочеш дізнатися більше про конкретний автомобіль — у тебе є доступ до <strong>Національної інформаційної системи (НАІС МВС)</strong>. Вводь номерний знак будь-якого авто й перевіряй інформацію з бази даних поліції.</p>
            </div>

            <div className="stage-four-questions__audio-row">
              <button
                className="stage-one-secondary stage-four-questions__audio"
                type="button"
                onClick={playDialogue}
                disabled={playingDialogue || audioUnavailable}
              >
                {playingDialogue ? "▶ Репліка відтворюється…" : audioUnavailable ? "Аудіозапис ще не додано" : "▶ Прослухати репліку"}
              </button>
              {audioUnavailable && (
                <span className="stage-four-questions__audio-note">
                  Додайте файл assistant-stage-four.mp3 до public/audio/.
                </span>
              )}
            </div>

            <div className="stage-four-questions__database-action">
              <button type="button" className="stage-four-questions__lookup-button" onClick={openVehicleSearch}>
                <span aria-hidden="true">⌕</span> Відкрити базу транспортних засобів
              </button>
            </div>

            <div className="stage-four-questions__continue">
              <button
                type="button"
                className="stage-four-questions__continue-button"
                onClick={handleContinue}
                disabled={!hasVehicleAction}
                aria-describedby={!hasVehicleAction ? "stage-four-continue-lock" : undefined}
              >
                Продовжити розслідування
              </button>
              {!hasVehicleAction && (
                <p id="stage-four-continue-lock" className="stage-four-questions__continue-lock">
                  Спочатку виконайте дію щодо автомобіля або його власника в базі транспортних засобів:
                  заплануйте допит або клопотання про підозру.
                </p>
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
