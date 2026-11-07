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

const envelope4DocsAnalysis = [
  {
    documentName: "Витяг з ЄРДР",
    whatIsIt: "Офіційна зміна статті злочину.",
    keyFacts: "Справу перекваліфіковано з ДТП на умисне вбивство — ч. 1 ст. 115 КК України.",
    howToAnalyze: "Це наше зелене світло. Тепер ми маємо всі повноваження на жорсткі допити, затримання та невідкладні обшуки. Вбивство було інсценовано під аварію.",
  },
  {
    documentName: "Протокол та схема огляду місця події (Дача № 42)",
    whatIsIt: "Звіт первинної групи з місця, де телефон потерпілого вимкнувся о 22:45.",
    keyFacts: "На траві знайшли бурі плями крові та гіпсовий зліпок невідомого взуття 44-45 розміру, спрямований до виїзду. Знаряддя не знайшли.",
    howToAnalyze: "Головний провал попередників: вони оглянули тільки двір і не заходили в сам будинок! Треба негайно брати ухвалу на обшук всередині дачі. Також розмір 44-45 — це наша головна зачіпка для пошуку виконавця вбивства.",
  },
  {
    documentName: "Допит судмедексперта Дмитренка А. С.",
    whatIsIt: "Пояснення лікаря, який першим оглядав тіло і машину на дні прірви.",
    keyFacts: "Виправдовується, що в темряві переплутав пролом від бити на маківці з ударом об стійку авто. Темні смуги від тарана на бампері назвав «брудом».",
    howToAnalyze: "Фахівець із 15-річним стажем не міг так помилитися. Він свідомо приховував сліди вбивства. Шукаємо, хто йому заплатив — підрядники чи керівництво Водоканалу.",
  },
  {
    documentName: "Допит бухгалтерки Світличної І. О.",
    whatIsIt: "Показання колеги потерпілого, з якою він тісно спілкувався.",
    keyFacts: "Вона блондинка (збіг із волосиною в авто). Її чоловік Вадим носить 44-45 розмір взуття, дуже ревнивий, і в ніч вбивства виїхав з дому без алібі.",
    howToAnalyze: "Її чоловік — підозрюваний №1 у фізичному нанесенні удару. Зіставляємо його розмір ноги зі слідом на дачі та перевіряємо його білінг.",
  },
  {
    documentName: "Допит Захарова Г. В.",
    whatIsIt: "Показання директора «Міськводоканалу».",
    keyFacts: "Поводиться холодно і переводить стрілки на підрядників.",
    howToAnalyze: "Класична поведінка замовника. Йому був вигідний мертвий аудитор. Перевіряємо його службові позашляховики на сліди білої фарби потерпілого та вимагаємо точні маршрути руху.",
  },
  {
    documentName: "Допит Кравченка Д. Д.",
    whatIsIt: "Показання охоронця директора «Міськводоканалу».",
    keyFacts: "Дзвонив потерпілому у вихідний (неділю) нібито про «гальмівні колодки». На питання про маршрути різко замовк і почав нервувати.",
    howToAnalyze: "Підозріла поведінка. Перевіряємо його маршрути, телефонні з’єднання та можливу участь у супроводі або прикритті.",
  },
  {
    documentName: "Вигрузка «Відеоконтроль» V3",
    whatIsIt: "Дані з дорожніх камер біля дач.",
    keyFacts: "Камера №3 зафіксувала чорний Toyota Land Cruiser Prado (PE 2399 EH), який поїхав до дач о 22:20 і повернувся о 23:15. Це ідеально збігається з часом вбивства.",
    howToAnalyze: "Маємо часові рамки появи та зникнення підозрілого авто біля місця злочину. Далі зіставляємо з витягом з НАІС.",
  },
  {
    documentName: "Витяг з НАІС",
    whatIsIt: "База власників авто.",
    keyFacts: "Номер PE 2399 EH (чорний Toyota Land Cruiser Prado).",
    howToAnalyze: "Потрібно пробити номер по базі. Якщо авто належить Водоканалу, підрядникам або охоронцю — ми маємо машину, якою таранили Passat потерпілого у прірву.",
  },
  {
    documentName: "Протокол телефонної розмови з турагентством",
    whatIsIt: "Опитування менеджера агенції «Парадайз Тревел».",
    keyFacts: "5 липня потерпілий перерахував 116 437 грн готівкою за тур на Мальдіви.",
    howToAnalyze: "Цей документ повністю руйнує алібі дружини, яка клялася, що грошей у них не було. Тиснемо на неї цим фактом на повторному допиті: звідки взялася готівка і чому вона це приховала?",
  },
  {
    documentName: "Протоколи телефонних розмов з підрядниками",
    whatIsIt: "Опитування Драпчука та Кононенка (ТОВ «ДніпроСпецБуд»).",
    keyFacts: "Кононенко зізнався у конфлікті з Ковальчуком щодо завищених кошторисів. Вони мають у власності масивну вантажну техніку.",
    howToAnalyze: "Прямий фінансовий мотив. Ковальчук блокував їм акти виконаних робіт. Треба оглянути їхні вантажівки та техніку на предмет свіжого ремонту бампера або залишків фарби.",
  },
]

const PROCEDURAL_ACTIONS: ProceduralAction[] = [
  {
    id: "olena-interrogation",
    title: "Повторний допит Олени Ковальчук",
    details:
      "Перевірка показань дружини потерпілого щодо приховування статків, походження готівки та сплати туру на Мальдіви.",
  },
  {
    id: "atm-video-request",
    title: "Витребування відео з банкомату «ДністроБанк»",
    details:
      "Отримання записів камер за 05.07.2026 о 11:15 (Термінал #402, Філія № 4) для ідентифікації особи, яка вносила 118 676 грн.",
  },
  {
    id: "svitlychnyi-interrogation",
    title: "Допит Вадима Світличного",
    details:
      "Опитування чоловіка Ірини Світличної щодо мотиву ревнощів до потерпілого та перевірка його алібі на вечір 06.07.2026.",
  },
  {
    id: "waterworks-doc-seizure",
    title: "Вилучення документів КП «Міськводоканал»",
    details:
      "Тимчасовий доступ до кошторисів, закриваючих актів та договорів із ТОВ «ДніпроСпецБуд», які відмовлявся підписувати Ковальчук.",
  },
  {
    id: "cell-4598-triangulation",
    title: "Аналіз радіоелектронної обстановки (Cell ID 4598)",
    details:
      "Отримання вигрузки CDR щодо всіх активних абонентів у секторі С/Т «Зелений Гай» за 06.07.2026 з 21:30 по 23:15.",
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
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [submittedActionIds, setSubmittedActionIds] = useState<string[]>([])
  const [showSubmissionConfirmation, setShowSubmissionConfirmation] =
    useState(false)
  const { notes, addNote } = useInvestigatorNotebook()
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

  function stopInvestigationTheme() {
    const music = getMusicElement()

    if (music) {
      music.pause()
      music.currentTime = 0
    }
  }

  function openMaterialsModal() {
    stopDialogue()
    setShowSubmissionConfirmation(false)
    setShowMaterialsModal(true)
  }

  function openDocumentsModal() {
    stopDialogue()
    setShowDocumentsModal(true)
  }

  function toggleProceduralAction(id: string) {
    if (submittedActionIds.includes(id)) return

    setSelectedActions((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function submitProceduralActions() {
    const selected = PROCEDURAL_ACTIONS.filter(
      (action) =>
        selectedActions.includes(action.id) &&
        !submittedActionIds.includes(action.id) &&
        !notes.some((note) => note.title === action.title),
    )

    if (selected.length === 0) {
      setSelectedActions([])
      return
    }

    selected.forEach((action) => {
      addNote({
        title: action.title,
        details: action.details,
        status: "pending",
        source: "Етап 04 · Конверт 04 · Процесуальні дії",
      })
    })

    setSubmittedActionIds((current) => [
      ...current,
      ...selected.map((action) => action.id),
    ])
    setSelectedActions([])
    setShowSubmissionConfirmation(true)

    const confirmationAudio = new Audio("/audio/perechid.mp3")
    confirmationAudio.volume = 1
    void confirmationAudio.play().catch(() => undefined)
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
              onClick={openMaterialsModal}
            >
              Запросити інші матеріали
            </button>
            <button
              className="stage-one-primary"
              type="button"
              onClick={openDocumentsModal}
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

                <div
                  className="fourth-envelope__modal-text"
                  id="fourth-envelope-materials-title"
                >
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
                    Ну і головне — розтрощений телефон Ковальчука: якщо технарям
                    вдасться витягнути з нього дані та паролі, у нас буде багато
                    нової роботи.
                  </p>
                  <p>
                    До того ж, я наполягаю, щоб ми детально оглянули й інші
                    вилучені речі: розбиті окуляри, особисті документи з
                    ключами, посвідченням водія та свідоцтвом про реєстрацію ТЗ.
                  </p>
                  <p>
                    І особливо — чорний шкіряний гаманець із внутрішньої кишені
                    його куртки: треба ретельно перевірити весь його вміст, усі
                    банківські картки та готівку, бо там може бути щось дуже
                    цікаве.
                  </p>
                </div>

                <div className="fourth-envelope__modal-question">
                  Які процесуальні дії бажаєте призначити першочергово?
                </div>

                <div className="fourth-envelope__procedural-list">
                  {PROCEDURAL_ACTIONS.map((action) => {
                    const checked = selectedActions.includes(action.id)
                    const alreadyAdded =
                      submittedActionIds.includes(action.id) ||
                      notes.some((note) => note.title === action.title)

                    return (
                      <label
                        key={action.id}
                        className={`fourth-envelope__procedural-option${checked ? " is-selected" : ""}${alreadyAdded ? " is-added" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked || alreadyAdded}
                          disabled={alreadyAdded}
                          onChange={() => toggleProceduralAction(action.id)}
                        />
                        <span className="fourth-envelope__procedural-check">
                          {alreadyAdded ? "✓" : checked ? "✓" : ""}
                        </span>
                        <span className="fourth-envelope__procedural-copy">
                          <strong>{action.title}</strong>
                          <small>
                            {alreadyAdded
                              ? "Дію вже додано до блокнота. Повторне надсилання недоступне."
                              : action.details}
                          </small>
                        </span>
                      </label>
                    )
                  })}
                </div>

                {showSubmissionConfirmation && (
                  <div
                    className="fourth-envelope__submission-confirmation"
                    role="status"
                  >
                    <span className="fourth-envelope__submission-icon">✓</span>
                    <div>
                      <strong>Дії додано до блокнота</strong>
                      <small>
                        Запит збережено у блокноті слідчого. Додані дії більше
                        не можна надіслати повторно.
                      </small>
                    </div>
                  </div>
                )}

                <div className="fourth-envelope__modal-actions">
                  <button
                    type="button"
                    className="stage-one-primary"
                    disabled={
                      selectedActions.length === 0 ||
                      selectedActions.every((id) => {
                        const action = PROCEDURAL_ACTIONS.find(
                          (item) => item.id === id,
                        )
                        return (
                          submittedActionIds.includes(id) ||
                          Boolean(
                            action &&
                            notes.some((note) => note.title === action.title),
                          )
                        )
                      })
                    }
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


        {showDocumentsModal && (
          <div
            className="fourth-envelope__modal-backdrop"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setShowDocumentsModal(false)
              }
            }}
          >
            <section
              className="fourth-envelope__modal fourth-envelope__documents-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="fourth-envelope-documents-title"
            >
              <div className="fourth-envelope__modal-topline">
                <span>
                  <i />
                  АНАЛІЗ ДОКУМЕНТІВ · КОНВЕРТ 04
                </span>
                <button
                  type="button"
                  className="fourth-envelope__modal-close"
                  aria-label="Закрити"
                  onClick={() => setShowDocumentsModal(false)}
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

                <div
                  className="fourth-envelope__documents-intro"
                  id="fourth-envelope-documents-title"
                >
                  <h2>Що маємо у четвертому конверті</h2>
                  <p>
                    Тут зібрані документи, які вже можна розкласти по версіях,
                    мотивах та наступних кроках розслідування.
                  </p>
                </div>

                <div className="fourth-envelope__documents-list">
                  {envelope4DocsAnalysis.map((document, index) => (
                    <article
                      key={document.documentName}
                      className="fourth-envelope__document-card"
                    >
                      <div className="fourth-envelope__document-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="fourth-envelope__document-body">
                        <h3>{document.documentName}</h3>

                        <div className="fourth-envelope__document-section">
                          <span>ЩО ЦЕ</span>
                          <p>{document.whatIsIt}</p>
                        </div>

                        <div className="fourth-envelope__document-section">
                          <span>КЛЮЧОВІ ФАКТИ</span>
                          <p>{document.keyFacts}</p>
                        </div>

                        <div className="fourth-envelope__document-section fourth-envelope__document-section--analysis">
                          <span>ЯК АНАЛІЗУВАТИ</span>
                          <p>{document.howToAnalyze}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="fourth-envelope__modal-actions fourth-envelope__documents-actions">
                  <button
                    type="button"
                    className="stage-one-secondary"
                    onClick={() => setShowDocumentsModal(false)}
                  >
                    Назад до конверта
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
