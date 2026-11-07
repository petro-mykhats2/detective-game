import { useEffect, useRef, useState } from "react"
import "./FourthEnvelope.css"
import { useInvestigatorNotebook } from "../../components/InvestigatorNotebook/InvestigatorNotebookContext"

const AUDIO_FOURTH_ENVELOPE = "/audio/assistant-stage-two-next.mp3"

const FOURTH_ENVELOPE_AUDIO_DELAY_DESKTOP_MS = 2500
const FOURTH_ENVELOPE_AUDIO_DELAY_MOBILE_MS = 200
const FOURTH_ENVELOPE_VOICE_VOLUME = 1
const FOURTH_ENVELOPE_MUSIC_VOLUME_DURING_VOICE = 0.1

type ProceduralAction = {
  id: string
  title: string
  details: string
}

const PROCEDURAL_ACTIONS: ProceduralAction[] = [
  {
    id: "shoe-traceology",
    title: "Трасологічна експертиза зліпків взуття",
    details: "Порівняти зліпки взуття 41–42 та 44–45 розміру з можливими зразками.",
  },
  {
    id: "grass-dna",
    title: "ДНК-експертиза крові з трави",
    details: "Встановити належність біологічного матеріалу, вилученого на дачі.",
  },
  {
    id: "hair-expertise",
    title: "Експертиза світлої волосини з автомобіля",
    details: "Встановити походження волосини та отримати доступний генетичний профіль.",
  },
  {
    id: "fingerprints",
    title: "Дактилоскопічна експертиза",
    details: "Дослідити відбитки з керма та дверей автомобіля.",
  },
  {
    id: "phone-forensics",
    title: "Комп'ютерно-технічна експертиза телефону Ковальчука",
    details: "Спробувати відновити дані, паролі та іншу інформацію з розтрощеного телефону.",
  },
  {
    id: "wallet-and-items",
    title: "Детальний огляд вилучених речей",
    details: "Окремо перевірити розбиті окуляри, документи з ключами, посвідченням водія, свідоцтвом про реєстрацію ТЗ та вміст чорного шкіряного гаманця, включно з банківськими картками й готівкою.",
  },
  {
    id: "additional-interrogation",
    title: "Додаткові допити у справі",
    details: "Призначити додаткові допити осіб, чиї свідчення можуть уточнити обставини події.",
  },
]


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
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const { addNote } = useInvestigatorNotebook()
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

  function toggleProceduralAction(id: string) {
    setSelectedActions((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function submitProceduralActions() {
    const selected = PROCEDURAL_ACTIONS.filter((action) =>
      selectedActions.includes(action.id),
    )

    selected.forEach((action) => {
      addNote({
        title: action.title,
        details: action.details,
        status: "pending",
        source: "Етап 04 · Конверт 04 · Процесуальні дії",
      })
    })

    setSelectedActions([])
    setShowMaterialsModal(false)
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
              onClick={() => setShowMaterialsModal(true)}
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

        {showMaterialsModal && (
          <div
            className="fourth-envelope__modal-backdrop"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setShowMaterialsModal(false)
              }
            }}
          >
            <section
              className="fourth-envelope__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="fourth-envelope-materials-title"
            >
              <div className="fourth-envelope__modal-topline">
                <span>
                  <i />
                  ЗАПИТ НА ДОДАТКОВІ МАТЕРІАЛИ
                </span>
                <button
                  type="button"
                  className="fourth-envelope__modal-close"
                  aria-label="Закрити"
                  onClick={() => setShowMaterialsModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="fourth-envelope__modal-content">
                <div className="fourth-envelope__modal-assistant">
                  <img
                    className="assistant-mark"
                    aria-hidden="true"
                    src="/assistant-mark.png"
                  />
                  <div>
                    <div className="fourth-envelope__eyebrow">
                      напарник Андрій
                    </div>
                    <div className="fourth-envelope__subtitle">
                      ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ
                    </div>
                  </div>
                </div>

                <div className="fourth-envelope__modal-text">
                  <p>
                    Капітане, по експертизах ми зараз чекаємо результати
                    трасології зліпків взуття (41-42 та 44-45 розміру) та
                    ДНК-тест крові з трави, які знайшли на дачі.
                  </p>
                  <p>
                    Також чекаємо експертизу світлої волосини з машини та
                    дактилоскопію відбитків з керма і дверей.
                  </p>
                  <p>
                    Ну і головне — розтрощений телефон Ковальчука: якщо
                    технарям вдасться витягнути з нього дані та паролі, у нас
                    буде багато нової роботи.
                  </p>
                  <p>
                    До того ж, я наполягаю, щоб ми детально оглянули й інші
                    вилучені речі: розбиті окуляри, особисті документи з
                    ключами, посвідченням водія та свідоцтвом про реєстрацію
                    ТЗ.
                  </p>
                  <p>
                    І особливо — чорний шкіряний гаманець із внутрішньої
                    кишені його куртки: треба ретельно перевірити весь його
                    вміст, усі банківські картки та готівку, бо там може бути
                    щось дуже цікаве.
                  </p>
                </div>

                <div className="fourth-envelope__modal-question">
                  Які процесуальні дії бажаєте призначити першочергово?
                </div>

                <div className="fourth-envelope__procedural-list">
                  {PROCEDURAL_ACTIONS.map((action) => {
                    const checked = selectedActions.includes(action.id)

                    return (
                      <label
                        key={action.id}
                        className={`fourth-envelope__procedural-option${checked ? " is-selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProceduralAction(action.id)}
                        />
                        <span className="fourth-envelope__procedural-check">
                          {checked ? "✓" : ""}
                        </span>
                        <span className="fourth-envelope__procedural-copy">
                          <strong>{action.title}</strong>
                          <small>{action.details}</small>
                        </span>
                      </label>
                    )
                  })}
                </div>

                <div className="fourth-envelope__modal-actions">
                  <button
                    type="button"
                    className="stage-one-primary"
                    disabled={selectedActions.length === 0}
                    onClick={submitProceduralActions}
                  >
                    Подати запит на вибрані процесуальні дії
                  </button>
                  <button
                    type="button"
                    className="stage-one-secondary"
                    onClick={() => setShowMaterialsModal(false)}
                  >
                    Назад
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        <footer className="fourth-envelope__footer">
          <span>КРИМІНАЛЬНЕ ПРОВАДЖЕННЯ № 12026170010000456</span>
          <span>КОНВЕРТ 04</span>
        </footer>
      </div>
    </main>
  )
}
