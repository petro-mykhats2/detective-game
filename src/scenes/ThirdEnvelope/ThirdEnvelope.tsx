import { useEffect, useRef, useState } from "react"
import "./ThirdEnvelope.css"

type Props = { onBack?: () => void; onComplete: () => void }

type ChoiceId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J"

type Choice = {
  id: ChoiceId
  text: string
  reply: string
  question: string
  answers: { id: string; text: string; correct?: boolean; feedback: string }[]
}

const VIDEO_FILE = "" // Додайте сюди шлях до відео, наприклад "/video/envelope-three.mp4".
const MUSIC_SELECTOR = 'audio[src="/investigation-theme.mp3"]'
const MUSIC_DURING_VIDEO = 0.12
const INTRO_DELAY_DESKTOP = 300
const INTRO_DELAY_TOUCH = 250

const choices: Choice[] = [
  {
    id: "A",
    text: "Дружина розповідала, що він іноді бував дуже втомленим. Можливо, заснув за кермом і через це злетів з дороги. Треба перевірити цю версію. Опитаємо людей, з якими він спілкувався останнім часом.",
    reply:
      "Цілком можливо. Але є одна деталь, яка мене непокоїть. Якщо він загинув від травми, отриманої ще до падіння автомобіля, то як це пояснює версію із засинанням за кермом?",
    question: "Що в цій ситуації потрібно з'ясувати насамперед?",
    answers: [
      {
        id: "a1",
        text: "Чи справді Ковальчук був втомлений перед поїздкою.",
        feedback:
          "Втома могла вплинути на керування, але сама по собі не пояснює встановлену експертом послідовність ушкоджень.",
      },
      {
        id: "a2",
        text: "Чи міг він заснути за кермом і втратити контроль над автомобілем.",
        feedback:
          "Цю версію можна перевірити, але вона поки не пояснює, коли виникла смертельна травма.",
      },
      {
        id: "a3",
        text: "Чи міг він отримати смертельну травму ще до падіння автомобіля.",
        correct: true,
        feedback:
          "Саме це питання зараз найважливіше. Втома могла мати значення, але вона не пояснює висновок експерта.",
      },
    ],
  },
  {
    id: "B",
    text: "Експерт не стверджує, що це вбивство. Він лише встановив травму голови. Автомобіль упав із великої висоти — приблизно з п'ятого поверху. Хіба такі ушкодження не могли виникнути під час падіння? Я б поки не поспішав довіряти цьому висновку.",
    reply:
      "Розумію ваші сумніви. Але експерт досліджував не тільки саму травму, а й те, коли виникли інші ушкодження. Подивіться уважніше: що він написав про травми, пов'язані з падінням автомобіля?",
    question: "Який висновок зробив експерт щодо цих ушкоджень?",
    answers: [
      {
        id: "b1",
        text: "Усі ушкодження виникли під час падіння автомобіля.",
        feedback:
          "Ні. У висновку окремо зазначено, що ушкодження, пов'язані з падінням автомобіля, мають посмертний характер.",
      },
      {
        id: "b2",
        text: "Ушкодження, пов'язані з падінням автомобіля, мають посмертний характер.",
        correct: true,
        feedback:
          "Саме так. Важлива не лише сила удару, а й послідовність подій: смертельна травма виникла за життя, а ушкодження від падіння — після смерті.",
      },
      {
        id: "b3",
        text: "Експерт не зміг визначити послідовність виникнення ушкоджень.",
        feedback:
          "Експерт зробив висновок щодо характеру ушкоджень. Перевірте підсумкову частину документа.",
      },
    ],
  },
  {
    id: "C",
    text: "У первинному протоколі огляду місця події зазначено, що це ДТП. На той момент слідчі вже зафіксували обставини. Можливо, не варто поспішати з висновками й змінювати початкову версію.",
    reply:
      "Але протокол первинного огляду фіксує те, що побачили на місці події. Тоді ми ще не мали результатів судово-медичної експертизи. Хіба нові докази не можуть змінити наше початкове уявлення про те, що сталося?",
    question:
      "На що ми повинні спиратися, коли з'являються нові результати експертизи?",
    answers: [
      {
        id: "c1",
        text: "На першу версію, оскільки вона була зафіксована в документах.",
        feedback:
          "Початкова версія не стає незмінною лише тому, що її першою записали в протоколі.",
      },
      {
        id: "c2",
        text: "На всі наявні матеріали справи, враховуючи нові результати.",
        correct: true,
        feedback:
          "Так. Нові результати потрібно зіставляти з усіма попередніми матеріалами, а не ігнорувати їх.",
      },
      {
        id: "c3",
        text: "На пояснення свідків, навіть якщо вони суперечать експертизі.",
        feedback:
          "Показання важливі, але їх потрібно перевіряти та зіставляти з іншими доказами.",
      },
    ],
  },
  {
    id: "D",
    text: "Треба змінити кваліфікацію справи на умисне вбивство й продовжити розслідування за цією версією. Результати експертизи дають для цього підстави.",
    reply:
      "Згоден. Висновок експерта суттєво змінює картину. Схоже, ми від самого початку могли розслідувати не ту подію. Треба оформити зміну кваліфікації та рухатися далі.",
    question: "Що саме стало головною підставою для такого рішення?",
    answers: [
      {
        id: "d1",
        text: "Відсутність алкоголю та наркотичних речовин у крові потерпілого.",
        feedback:
          "Це важлива обставина, але вона не пояснює послідовність виникнення смертельної травми та інших ушкоджень.",
      },
      {
        id: "d2",
        text: "Те, що смертельна травма виникла за життя, а ушкодження від падіння автомобіля — посмертно.",
        correct: true,
        feedback:
          "Саме так. Це ключова обставина, яка змушує переглянути попередню версію. Водночас експертиза сама по собі не встановлює особу винного.",
      },
      {
        id: "d3",
        text: "Те, що дружина потерпілого не надала достатньо інформації.",
        feedback:
          "Показання дружини можуть мати значення, але рішення на цьому етапі спирається насамперед на результати експертизи.",
      },
    ],
  },
  {
    id: "E",
    text: "Не виключено, що це могло бути самогубство. Треба перевірити, чи були в нього причини так вчинити, чи мав він якісь проблеми останнім часом.",
    reply:
      "Таку версію теж не можна просто відкинути. Але перш ніж шукати можливий мотив, треба зрозуміти, чи узгоджується вона з результатами експертизи. Чи встановили ми, за яких обставин виникла смертельна травма?",
    question: "Що наразі відомо з висновку експерта?",
    answers: [
      {
        id: "e1",
        text: "Смертельна травма виникла за життя, інші ушкодження від падіння автомобіля — посмертно.",
        correct: true,
        feedback:
          "Так, це встановлено. Але експерт не встановлював, хто і за яких обставин завдав смертельної травми.",
      },
      {
        id: "e2",
        text: "Експерт встановив, що потерпілий сам завдав собі травму.",
        feedback:
          "Ні. Таких висновків у наданому експертному дослідженні немає.",
      },
      {
        id: "e3",
        text: "Експерт підтвердив, що смерть настала безпосередньо внаслідок ДТП.",
        feedback:
          "Це не відповідає висновку про посмертний характер ушкоджень, пов'язаних із падінням автомобіля.",
      },
    ],
  },
  {
    id: "F",
    text: "Я б ще раз поговорив із дружиною. Можливо, під час першої розмови вона не все розповіла або згадала не всі подробиці. Треба уточнити деякі моменти.",
    reply:
      "Не заперечую. Повторна розмова може дати нові подробиці. Але скажіть, що саме ми хочемо від неї дізнатися? Ми ж не можемо просто викликати людину ще раз без конкретних запитань.",
    question: "Яку тему варто уточнити під час повторної розмови?",
    answers: [
      {
        id: "f1",
        text: "Де і з ким Ковальчук проводив час перед загибеллю та які обставини його останнього дня відомі дружині.",
        correct: true,
        feedback:
          "Так. Конкретні запитання допоможуть отримати перевірювані відомості, а не просто повторити попередню розмову.",
      },
      {
        id: "f2",
        text: "Чому дружина не повідомила поліції про всі телефонні дзвінки.",
        feedback:
          "Поки немає підстав стверджувати, що вона щось приховала. Спершу потрібно з'ясувати факти.",
      },
      {
        id: "f3",
        text: "Чи готова дружина назвати людину, яка могла вбити її чоловіка.",
        feedback:
          "Таке запитання передчасне: ми ще не встановили обставини, за яких виникла смертельна травма.",
      },
    ],
  },
  {
    id: "G",
    text: "Дружина була останньою, хто розмовляв із Ковальчуком. Хто знає, про що вони говорили? Можливо, між ними виникла сварка, після якої все й сталося. Треба перевірити її можливу причетність.",
    reply:
      "Можливо. Але те, що людина була останньою співрозмовницею потерпілого, ще не робить її причетною до злочину. Потрібні конкретні підстави. Що саме ми маємо перевірити, перш ніж робити такі висновки?",
    question: "Що буде правильним наступним кроком?",
    answers: [
      {
        id: "g1",
        text: "Одразу вручити дружині підозру.",
        feedback:
          "Для такого рішення недостатньо лише факту останньої телефонної розмови.",
      },
      {
        id: "g2",
        text: "Перевірити час і обставини їхньої останньої розмови, зіставити її пояснення з іншими матеріалами справи.",
        correct: true,
        feedback:
          "Саме так. Спочатку потрібно перевірити факти, а вже потім робити висновки.",
      },
      {
        id: "g3",
        text: "Вважати її головною підозрюваною, поки вона не доведе протилежне.",
        feedback:
          "Не можна вважати людину винною лише через підозру чи припущення.",
      },
    ],
  },
  {
    id: "H",
    text: "Подивись, задня частина автомобіля пошкоджена, а експерт знайшов на ній чуже темне лакофарбове покриття. Можливо, хтось наздогнав Ковальчука й навмисно протаранив його автомобіль, зіштовхнувши з дороги. Треба з'ясувати, чи не було в нього конфлікту з кимось із водіїв або знайомих.",
    reply:
      "Я теж звернув увагу на ці пошкодження. Але якщо його справді протаранили, виникає питання: чому ми поки не знаємо, кому належить це чуже покриття? Можливо, спочатку варто встановити, який саме автомобіль міг залишити ці сліди.",
    question: "Що варто з'ясувати насамперед?",
    answers: [
      {
        id: "h1",
        text: "Чи мав Ковальчук конфлікти з іншими водіями або знайомими.",
        feedback:
          "Це може допомогти встановити можливий мотив, але спочатку потрібно перевірити сам факт контакту з іншим автомобілем.",
      },
      {
        id: "h2",
        text: "Який автомобіль міг залишити темні сліди лакофарбового покриття.",
        correct: true,
        feedback:
          "Саме це дозволить перевірити версію зіткнення. Потрібно дослідити походження нашарувань і порівняти їх із можливими зразками.",
      },
      {
        id: "h3",
        text: "Чи були поблизу місця події свідки, які бачили автомобіль Ковальчука.",
        feedback:
          "Свідки можуть бути корисними, але їхні показання не встановлять походження виявленого лакофарбового покриття.",
      },
    ],
  },
  {
    id: "I",
    text: "Ось це вже дивно. Пасок безпеки був застебнутий, але експерт не знайшов слідів натягу, які очікував побачити після такого сильного падіння. Можливо, хтось пристебнув Ковальчука вже після того, як він загинув. Навіщо комусь це було потрібно?",
    reply:
      "Це справді викликає запитання. Якщо ремінь застебнули вже після смерті, хтось міг намагатися створити враження, що водій перебував за кермом під час падіння. Але не поспішаймо з висновками: автотехнічна експертиза сама по собі не встановлює момент смерті. Треба зіставити її результати із судово-медичним висновком.",
    question: "Які матеріали потрібно зіставити, щоб перевірити цю версію?",
    answers: [
      {
        id: "i1",
        text: "Показання дружини та знайомих про останні години життя Ковальчука.",
        feedback:
          "Ці свідчення можуть допомогти відновити його останні години, але не встановлять, коли саме було застебнуто ремінь.",
      },
      {
        id: "i2",
        text: "Висновок автотехнічної експертизи та судово-медичний висновок про характер і послідовність травм.",
        correct: true,
        feedback:
          "Саме зіставлення цих матеріалів допоможе перевірити, чи узгоджується стан ременя з установленою послідовністю отримання травм.",
      },
      {
        id: "i3",
        text: "Результати дослідження відбитків пальців на кермі та дверях автомобіля.",
        feedback:
          "Відбитки можуть допомогти встановити, хто торкався автомобіля, але самі по собі не визначають, коли водій отримав смертельну травму.",
      },
    ],
  },
  {
    id: "J",
    text: "Результати експертиз досить цікаві… Я ж казав, що тут щось не так. Ви теж це помітили?",
    reply:
      "Саме так. Думаю, нам час переглянути початкову кваліфікацію справи. Результати експертиз дають підстави перевіряти версію, що Ковальчук міг загинути ще до падіння автомобіля. Це вже може бути не звичайна дорожньо-транспортна пригода, а умисне вбивство. Пропоную ініціювати перекваліфікацію справи за частиною першою статті 115 КК України.",
    question: "Як вважаєте, варто змінити напрямок розслідування?",
    answers: [
      {
        id: "j1",
        text: "Мабуть, ти правий. Треба перевіряти версію умисного вбивства.",
        correct: true,
        feedback:
          "Саме так. Нові результати експертиз ставлять під сумнів версію звичайної ДТП. Тепер потрібно перевірити версію умисного вбивства. Це ще не доводить вини конкретної особи, але дає підстави змінити напрямок розслідування.",
      },
      {
        id: "j2",
        text: "Поки що маємо недостатньо підстав для такої перекваліфікації. Треба зібрати більше доказів.",
        feedback:
          "Обережність виправдана. Але нові обставини вже дають підстави перевірити версію умисного вбивства, не вважаючи її доведеною.",
      },
    ],
  },
]

function getMusicElement() {
  return document.querySelector(MUSIC_SELECTOR) as HTMLAudioElement | null
}

export default function ThirdEnvelope({ onBack, onComplete }: Props) {
  const [introVisible, setIntroVisible] = useState(false)
  const [videoStarted, setVideoStarted] = useState(false)
  const [videoFinished, setVideoFinished] = useState(false)
  const [opening, setOpening] = useState(false)
  const [noticed, setNoticed] = useState<boolean | null>(null)
  const [selected, setSelected] = useState<ChoiceId | null>(null)
  const [answerId, setAnswerId] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showQualificationInfo, setShowQualificationInfo] = useState(false)
  const [notebookOpen, setNotebookOpen] = useState(false)
  const [phoneContactsActionAdded, setPhoneContactsActionAdded] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const introTimer = useRef<number | null>(null)
  const transitionTimer = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const previousMusicVolume = useRef<number | null>(null)
  const [videoError, setVideoError] = useState(false)

  const choice = choices.find((item) => item.id === selected)
  const selectedAnswer = choice?.answers.find((item) => item.id === answerId)

  function duckMusic() {
    const music = getMusicElement()
    if (!music || previousMusicVolume.current !== null) return
    previousMusicVolume.current = music.volume
    music.volume = MUSIC_DURING_VIDEO
  }

  function restoreMusic() {
    const music = getMusicElement()
    if (music && previousMusicVolume.current !== null) {
      music.volume = previousMusicVolume.current
      previousMusicVolume.current = null
    }
  }

  function finishVideo() {
    setVideoFinished(true)
    restoreMusic()
  }

  useEffect(() => {
    introTimer.current = window.setTimeout(
      () => {
        setIntroVisible(true)
        window.setTimeout(() => {
          setVideoStarted(true)
          if (VIDEO_FILE) {
            duckMusic()
            const video = videoRef.current
            if (video) {
              void video.play().catch(() => {
                setVideoError(true)
                finishVideo()
              })
            }
          } else {
            // Заглушка триває стільки ж, скільки коротка атмосферна заставка.
            duckMusic()
            window.setTimeout(finishVideo, 2200)
          }
        }, 1200)
      },
      window.matchMedia("(pointer: coarse)").matches
        ? INTRO_DELAY_TOUCH
        : INTRO_DELAY_DESKTOP,
    )
    return () => {
      if (introTimer.current !== null) window.clearTimeout(introTimer.current)
      if (transitionTimer.current !== null)
        window.clearTimeout(transitionTimer.current)
      if (videoRef.current) videoRef.current.pause()
      restoreMusic()
    }
  }, [])

  function choose(id: ChoiceId) {
    setSelected(id)
    setAnswerId(null)
    setShowFeedback(false)
  }

  function submitAnswer() {
    if (!selectedAnswer) return
    setShowFeedback(true)
    if (selected === "A" && selectedAnswer.correct) {
      setPhoneContactsActionAdded(true)
    }
  }

  function continueFromDecision() {
    if (selected !== "J" || !selectedAnswer?.correct || transitioning) return
    setTransitioning(true)
    transitionTimer.current = window.setTimeout(onComplete, 850)
  }

  function resetChoice() {
    setSelected(null)
    setAnswerId(null)
    setShowFeedback(false)
  }

  return (
    <section
      className={`third-envelope ${opening ? "is-opening" : ""} ${transitioning ? "is-transitioning" : ""}`}
      aria-label="Етап 3: результати експертиз"
    >
      <div
        className={`third-envelope__blackout ${introVisible ? "is-gone" : ""}`}
        aria-hidden="true"
      />
      <header className="third-envelope__topline">
        <span>
          <i /> МАТЕРІАЛИ КРИМІНАЛЬНОГО ПРОВАДЖЕННЯ
        </span>
        <span>ЕТАП 03 · СПРАВА № 12026170010000456</span>
        {phoneContactsActionAdded && (
          <button
            type="button"
            className="third-envelope__notebook-trigger"
            aria-label="Відкрити спільний блокнот"
            aria-haspopup="dialog"
            aria-expanded={notebookOpen}
            onClick={() => setNotebookOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="3.5" width="15" height="17" rx="1.5" />
              <path d="M8 7.5h8M8 11.5h8M8 15.5h5M3.5 7v.01M3.5 12v.01M3.5 17v.01" />
            </svg>
            <span>Блокнот</span>
            <i aria-hidden="true" />
          </button>
        )}
      </header>

      <div
        className={`third-envelope__intro-media ${videoStarted ? "is-visible" : ""}`}
      >
        {VIDEO_FILE && !videoError ? (
          <video
            ref={videoRef}
            className="third-envelope__video"
            src={VIDEO_FILE}
            playsInline
            preload="auto"
            onEnded={finishVideo}
            onError={() => {
              setVideoError(true)
              finishVideo()
            }}
          />
        ) : (
          <div
            className="third-envelope__video-placeholder"
            role="img"
            aria-label="Відеозаглушка: на стіл кладуть матеріали експертиз"
          >
            <div className="third-envelope__table-light" />
            <div className="third-envelope__paper third-envelope__paper--one">
              <span>ВИСНОВОК</span>
              <b>СУДОВО-МЕДИЧНА ЕКСПЕРТИЗА</b>
              <small>№ 102/26</small>
            </div>
            <div className="third-envelope__paper third-envelope__paper--two">
              <span>ЕКСПЕРТНЕ ДОСЛІДЖЕННЯ</span>
              <b>АВТОТЕХНІЧНА ЕКСПЕРТИЗА</b>
              <small>МАТЕРІАЛИ СПРАВИ</small>
            </div>
            <div className="third-envelope__hand-shadow" />
            <div className="third-envelope__placeholder-caption">
              НОВІ МАТЕРІАЛИ НАДІЙШЛИ
            </div>
          </div>
        )}
      </div>

      {videoFinished && (
        <div className="third-envelope__content">
          <div className="third-envelope__eyebrow">
            <span>КОНВЕРТ № 3</span>
            <span>РЕЗУЛЬТАТИ ЕКСПЕРТИЗ</span>
          </div>
          <h1>Картина змінюється</h1>
          {!opening ? (
            <div className="third-envelope__assistant">
              <img
                src="/assistant-mark.png"
                className="third-envelope__avatar"
              />
              <div>
                <div className="third-envelope__speaker">
                  НАПАРНИК <small>ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ</small>
                </div>
                <p>
                  Результати експертизи досить цікаві… Я ж казав, що тут щось не
                  так. Ви теж це помітили?
                </p>
                <div className="third-envelope__actions">
                  <button
                    onClick={() => {
                      setNoticed(true)
                      setOpening(true)
                    }}
                  >
                    Так, дещо тут справді не сходиться.
                  </button>
                  <button
                    className="is-quiet"
                    onClick={() => {
                      setNoticed(false)
                      setOpening(true)
                    }}
                  >
                    Ні, а що саме вас насторожило?
                  </button>
                </div>
              </div>
            </div>
          ) : noticed === false ? (
            <div className="third-envelope__assistant third-envelope__assistant--follow">
              <div className="third-envelope__avatar">М</div>
              <div>
                <div className="third-envelope__speaker">напарник Андрій</div>
                <p>
                  Тоді ще раз уважно подивіться висновок судово-медичного
                  експерта. Особливо зверніть увагу на причину смерті та час
                  утворення ушкоджень.
                </p>
                <button
                  className="third-envelope__back-choice"
                  onClick={() => {
                    setOpening(false)
                    setNoticed(null)
                  }}
                >
                  Повернутися до запитання
                </button>
              </div>
            </div>
          ) : (
            <>
              {!selected ? (
                <div className="third-envelope__choices">
                  {choices.map((item) => (
                    <button
                      key={item.id}
                      className="third-envelope__choice"
                      onClick={() => choose(item.id)}
                    >
                      <span>{item.id}</span>
                      <p>{item.text}</p>
                      <b>→</b>
                    </button>
                  ))}
                </div>
              ) : choice ? (
                <div className="third-envelope__decision">
                  <div className="third-envelope__chosen">
                    <span>ВАШЕ РІШЕННЯ · {choice.id}</span>
                    <p>{choice.text}</p>
                  </div>
                  <div className="third-envelope__assistant third-envelope__assistant--follow">
                    <div className="third-envelope__avatar">М</div>
                    <div>
                      <div className="third-envelope__speaker">
                        напарник Андрій
                      </div>
                      <p>{choice.reply}</p>
                    </div>
                  </div>
                  <div className="third-envelope__question">
                    <div className="third-envelope__question-heading">
                      <h2>{choice.question}</h2>
                      {choice.id === "J" && (
                        <button
                          type="button"
                          className="third-envelope__info-button"
                          aria-label="Навіщо змінювати кваліфікацію справи?"
                          aria-expanded={showQualificationInfo}
                          onClick={() =>
                            setShowQualificationInfo((value) => !value)
                          }
                        >
                          i
                        </button>
                      )}
                    </div>
                    {choice.id === "J" && showQualificationInfo && (
                      <div className="third-envelope__info-panel">
                        <strong>Навіщо змінювати кваліфікацію справи?</strong>
                        <p>
                          Спочатку подію розслідували як дорожньо-транспортну
                          пригоду. Однак результати експертиз дають підстави
                          перевірити версію, що смертельна травма Ковальчука
                          виникла ще до падіння автомобіля.
                        </p>
                        <p>
                          Перекваліфікація визначить новий напрямок
                          розслідування та дозволить відкрити в грі наступні
                          процесуальні дії для перевірки версії умисного
                          вбивства. Кожна така дія все одно потребуватиме
                          передбачених законом підстав і дозволів, якщо вони
                          необхідні.
                        </p>
                      </div>
                    )}
                    {choice.answers.map((answer) => (
                      <button
                        key={answer.id}
                        className={`third-envelope__answer ${answerId === answer.id ? "is-selected" : ""}`}
                        onClick={() => {
                          setAnswerId(answer.id)
                          setShowFeedback(false)
                        }}
                      >
                        <span>{answer.id.slice(-1).toUpperCase()}</span>
                        {answer.text}
                      </button>
                    ))}
                    {showFeedback && selectedAnswer && (
                      <div
                        className={`third-envelope__feedback ${selectedAnswer.correct ? "is-correct" : ""}`}
                      >
                        <p>{selectedAnswer.feedback}</p>
                      </div>
                    )}
                    {showFeedback && selectedAnswer?.correct && selected === "A" && (
                      <div className="third-envelope__unlocked-action">
                        <div className="third-envelope__assistant third-envelope__assistant--follow">
                          <img src="/assistant-mark.png" className="third-envelope__avatar" />
                          <div>
                            <div className="third-envelope__speaker">НАПАРНИК АНДРІЙ</div>
                            <p>
                              Добре. Тоді перевірмо, з ким Ковальчук спілкувався перед загибеллю.
                              Можливо, ці контакти допоможуть нам встановити важливі обставини.
                              Як тільки отримаємо розшифровку номерів, обов'язково перевіримо всіх.
                              Поки що додаю це в список процесуальних дій. До речі, ви можете знайти
                              їх у нашому спільному блокноті, який прямо зараз з'явиться у верхній
                              частині екрана.
                            </p>
                          </div>
                        </div>
                        <div className="third-envelope__action-card">
                          <div className="third-envelope__action-card-top">
                            <span>НОВА СЛІДЧА ДІЯ</span>
                            <span className="third-envelope__action-status">ОЧІКУЄ МАТЕРІАЛІВ</span>
                          </div>
                          <h3>Аналіз телефонних контактів</h3>
                          <p>Матеріал: розшифрування дзвінків та результати дослідження відкритих джерел (OSINT).</p>
                          <div className="third-envelope__action-note">
                            <strong>Результат ще не відкрито</strong>
                            <span>Спочатку опрацюйте матеріали. Встановіть, які номери належать конкретним особам, а потім визначте, кого доцільно викликати на допит.</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                  <div className="third-envelope__decision-footer">
                    <button className="is-quiet" onClick={resetChoice}>
                      ← Інше рішення
                    </button>
                    {!showFeedback ? (
                      <button disabled={!answerId} onClick={submitAnswer}>
                        Відповісти
                      </button>
                    ) : selectedAnswer?.correct && selected === "J" ? (
                      <button onClick={continueFromDecision}>
                        Продовжити розслідування →
                      </button>
                    ) : (
                      <button onClick={resetChoice}>
                        Повернутися до рішень
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}

      {notebookOpen && (
        <div
          className="third-envelope__notebook-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setNotebookOpen(false)
          }}
        >
          <section
            className="third-envelope__notebook"
            role="dialog"
            aria-modal="true"
            aria-labelledby="third-envelope-notebook-title"
          >
            <div className="third-envelope__notebook-binding" aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <button
              type="button"
              className="third-envelope__notebook-close"
              aria-label="Закрити блокнот"
              onClick={() => setNotebookOpen(false)}
            >
              ×
            </button>
            <div className="third-envelope__notebook-heading">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3.5h13a1.5 1.5 0 0 1 1.5 1.5v15a.5.5 0 0 1-.8.4L17 18.5l-2.7 1.9a.5.5 0 0 1-.6 0L11 18.5l-2.7 1.9a.5.5 0 0 1-.8-.4v-15A1.5 1.5 0 0 1 9 3.5" />
                <path d="M3.5 6.5H6M3.5 11H6M3.5 15.5H6M10 8h7M10 12h7" />
              </svg>
              <div>
                <span>СПІЛЬНІ НОТАТКИ СЛІДЧОЇ ГРУПИ</span>
                <h2 id="third-envelope-notebook-title">Спільний блокнот</h2>
              </div>
            </div>
            <div className="third-envelope__notebook-paper">
              <div className="third-envelope__notebook-task">
                <span className="third-envelope__notebook-number">01</span>
                <span className="third-envelope__notebook-check" aria-hidden="true" />
                <div className="third-envelope__notebook-task-copy">
                  <strong>Перевірити, з ким Ковальчук спілкувався перед загибеллю</strong>
                  <span>Очікує на отримання розшифровки телефонних номерів</span>
                </div>
                <span className="third-envelope__notebook-status">НЕДОСТУПНО</span>
              </div>
              <div className="third-envelope__notebook-empty-lines" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index} />
                ))}
              </div>
            </div>
            <div className="third-envelope__notebook-footer">
              КРИМІНАЛЬНЕ ПРОВАДЖЕННЯ № 12026170010000456
            </div>
          </section>
        </div>
      )}

      <footer className="third-envelope__footer">
        {onBack && (
          <button className="is-quiet" onClick={onBack}>
            ← Назад до етапу 2
          </button>
        )}
        <span>ДОСЬЄ № 12026170010000456 · КОНВЕРТ 03</span>
        {videoFinished &&
          selected === "J" &&
          showFeedback &&
          selectedAnswer?.correct && (
            <span className="third-envelope__ready">РІШЕННЯ ЗАФІКСОВАНО</span>
          )}
      </footer>
    </section>
  )
}
