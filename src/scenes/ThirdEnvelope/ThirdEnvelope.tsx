import { useEffect, useRef, useState } from "react"
import "./ThirdEnvelope.css"

type Props = { onBack?: () => void; onComplete: () => void }

type ChoiceId = "A" | "B" | "C" | "D" | "E" | "F" | "G"

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
const INTRO_DELAY_DESKTOP = 1800
const INTRO_DELAY_TOUCH = 250

const choices: Choice[] = [
  {
    id: "A",
    text: "Дружина розповідала, що він іноді бував дуже втомленим. Можливо, заснув за кермом і через це злетів з дороги. Треба перевірити цю версію. Опитаємо людей, з якими він спілкувався останнім часом.",
    reply: "Цілком можливо. Але є одна деталь, яка мене непокоїть. Якщо він загинув від травми, отриманої ще до падіння автомобіля, то як це пояснює версію із засинанням за кермом?",
    question: "Що в цій ситуації потрібно з'ясувати насамперед?",
    answers: [
      { id: "a1", text: "Чи справді Ковальчук був втомлений перед поїздкою.", feedback: "Втома могла вплинути на керування, але сама по собі не пояснює встановлену експертом послідовність ушкоджень." },
      { id: "a2", text: "Чи міг він заснути за кермом і втратити контроль над автомобілем.", feedback: "Цю версію можна перевірити, але вона поки не пояснює, коли виникла смертельна травма." },
      { id: "a3", text: "Чи міг він отримати смертельну травму ще до падіння автомобіля.", correct: true, feedback: "Саме це питання зараз найважливіше. Втома могла мати значення, але вона не пояснює висновок експерта." },
    ],
  },
  {
    id: "B",
    text: "Експерт не стверджує, що це вбивство. Він лише встановив травму голови. Автомобіль упав із великої висоти — приблизно з п'ятого поверху. Хіба такі ушкодження не могли виникнути під час падіння? Я б поки не поспішав довіряти цьому висновку.",
    reply: "Розумію ваші сумніви. Але експерт досліджував не тільки саму травму, а й те, коли виникли інші ушкодження. Подивіться уважніше: що він написав про травми, пов'язані з падінням автомобіля?",
    question: "Який висновок зробив експерт щодо цих ушкоджень?",
    answers: [
      { id: "b1", text: "Усі ушкодження виникли під час падіння автомобіля.", feedback: "Ні. У висновку окремо зазначено, що ушкодження, пов'язані з падінням автомобіля, мають посмертний характер." },
      { id: "b2", text: "Ушкодження, пов'язані з падінням автомобіля, мають посмертний характер.", correct: true, feedback: "Саме так. Важлива не лише сила удару, а й послідовність подій: смертельна травма виникла за життя, а ушкодження від падіння — після смерті." },
      { id: "b3", text: "Експерт не зміг визначити послідовність виникнення ушкоджень.", feedback: "Експерт зробив висновок щодо характеру ушкоджень. Перевірте підсумкову частину документа." },
    ],
  },
  {
    id: "C",
    text: "У первинному протоколі огляду місця події зазначено, що це ДТП. На той момент слідчі вже зафіксували обставини. Можливо, не варто поспішати з висновками й змінювати початкову версію.",
    reply: "Але протокол первинного огляду фіксує те, що побачили на місці події. Тоді ми ще не мали результатів судово-медичної експертизи. Хіба нові докази не можуть змінити наше початкове уявлення про те, що сталося?",
    question: "На що ми повинні спиратися, коли з'являються нові результати експертизи?",
    answers: [
      { id: "c1", text: "На першу версію, оскільки вона була зафіксована в документах.", feedback: "Початкова версія не стає незмінною лише тому, що її першою записали в протоколі." },
      { id: "c2", text: "На всі наявні матеріали справи, враховуючи нові результати.", correct: true, feedback: "Так. Нові результати потрібно зіставляти з усіма попередніми матеріалами, а не ігнорувати їх." },
      { id: "c3", text: "На пояснення свідків, навіть якщо вони суперечать експертизі.", feedback: "Показання важливі, але їх потрібно перевіряти та зіставляти з іншими доказами." },
    ],
  },
  {
    id: "D",
    text: "Треба змінити кваліфікацію справи на умисне вбивство й продовжити розслідування за цією версією. Результати експертизи дають для цього підстави.",
    reply: "Згоден. Висновок експерта суттєво змінює картину. Схоже, ми від самого початку могли розслідувати не ту подію. Треба оформити зміну кваліфікації та рухатися далі.",
    question: "Що саме стало головною підставою для такого рішення?",
    answers: [
      { id: "d1", text: "Відсутність алкоголю та наркотичних речовин у крові потерпілого.", feedback: "Це важлива обставина, але вона не пояснює послідовність виникнення смертельної травми та інших ушкоджень." },
      { id: "d2", text: "Те, що смертельна травма виникла за життя, а ушкодження від падіння автомобіля — посмертно.", correct: true, feedback: "Саме так. Це ключова обставина, яка змушує переглянути попередню версію. Водночас експертиза сама по собі не встановлює особу винного." },
      { id: "d3", text: "Те, що дружина потерпілого не надала достатньо інформації.", feedback: "Показання дружини можуть мати значення, але рішення на цьому етапі спирається насамперед на результати експертизи." },
    ],
  },
  {
    id: "E",
    text: "Не виключено, що це могло бути самогубство. Треба перевірити, чи були в нього причини так вчинити, чи мав він якісь проблеми останнім часом.",
    reply: "Таку версію теж не можна просто відкинути. Але перш ніж шукати можливий мотив, треба зрозуміти, чи узгоджується вона з результатами експертизи. Чи встановили ми, за яких обставин виникла смертельна травма?",
    question: "Що наразі відомо з висновку експерта?",
    answers: [
      { id: "e1", text: "Смертельна травма виникла за життя, інші ушкодження від падіння автомобіля — посмертно.", correct: true, feedback: "Так, це встановлено. Але експерт не встановлював, хто і за яких обставин завдав смертельної травми." },
      { id: "e2", text: "Експерт встановив, що потерпілий сам завдав собі травму.", feedback: "Ні. Таких висновків у наданому експертному дослідженні немає." },
      { id: "e3", text: "Експерт підтвердив, що смерть настала безпосередньо внаслідок ДТП.", feedback: "Це не відповідає висновку про посмертний характер ушкоджень, пов'язаних із падінням автомобіля." },
    ],
  },
  {
    id: "F",
    text: "Я б ще раз поговорив із дружиною. Можливо, під час першої розмови вона не все розповіла або згадала не всі подробиці. Треба уточнити деякі моменти.",
    reply: "Не заперечую. Повторна розмова може дати нові подробиці. Але скажіть, що саме ми хочемо від неї дізнатися? Ми ж не можемо просто викликати людину ще раз без конкретних запитань.",
    question: "Яку тему варто уточнити під час повторної розмови?",
    answers: [
      { id: "f1", text: "Де і з ким Ковальчук проводив час перед загибеллю та які обставини його останнього дня відомі дружині.", correct: true, feedback: "Так. Конкретні запитання допоможуть отримати перевірювані відомості, а не просто повторити попередню розмову." },
      { id: "f2", text: "Чому дружина не повідомила поліції про всі телефонні дзвінки.", feedback: "Поки немає підстав стверджувати, що вона щось приховала. Спершу потрібно з'ясувати факти." },
      { id: "f3", text: "Чи готова дружина назвати людину, яка могла вбити її чоловіка.", feedback: "Таке запитання передчасне: ми ще не встановили обставини, за яких виникла смертельна травма." },
    ],
  },
  {
    id: "G",
    text: "Дружина була останньою, хто розмовляв із Ковальчуком. Хто знає, про що вони говорили? Можливо, між ними виникла сварка, після якої все й сталося. Треба перевірити її можливу причетність.",
    reply: "Можливо. Але те, що людина була останньою співрозмовницею потерпілого, ще не робить її причетною до злочину. Потрібні конкретні підстави. Що саме ми маємо перевірити, перш ніж робити такі висновки?",
    question: "Що буде правильним наступним кроком?",
    answers: [
      { id: "g1", text: "Одразу вручити дружині підозру.", feedback: "Для такого рішення недостатньо лише факту останньої телефонної розмови." },
      { id: "g2", text: "Перевірити час і обставини їхньої останньої розмови, зіставити її пояснення з іншими матеріалами справи.", correct: true, feedback: "Саме так. Спочатку потрібно перевірити факти, а вже потім робити висновки." },
      { id: "g3", text: "Вважати її головною підозрюваною, поки вона не доведе протилежне.", feedback: "Не можна вважати людину винною лише через підозру чи припущення." },
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
    introTimer.current = window.setTimeout(() => {
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
          window.setTimeout(finishVideo, 5200)
        }
      }, 1200)
    }, window.matchMedia("(pointer: coarse)").matches ? INTRO_DELAY_TOUCH : INTRO_DELAY_DESKTOP)
    return () => {
      if (introTimer.current !== null) window.clearTimeout(introTimer.current)
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
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
  }

  function continueFromDecision() {
    if (selected !== "D" || !selectedAnswer?.correct || transitioning) return
    setTransitioning(true)
    transitionTimer.current = window.setTimeout(onComplete, 850)
  }

  function resetChoice() {
    setSelected(null)
    setAnswerId(null)
    setShowFeedback(false)
  }

  return (
    <section className={`third-envelope ${opening ? "is-opening" : ""} ${transitioning ? "is-transitioning" : ""}`} aria-label="Етап 3: результати експертиз">
      <div className={`third-envelope__blackout ${introVisible ? "is-gone" : ""}`} aria-hidden="true" />
      <header className="third-envelope__topline">
        <span><i /> МАТЕРІАЛИ КРИМІНАЛЬНОГО ПРОВАДЖЕННЯ</span>
        <span>ЕТАП 03 · СПРАВА № 12026170010000456</span>
      </header>

      <div className={`third-envelope__intro-media ${videoStarted ? "is-visible" : ""}`}>
        {VIDEO_FILE && !videoError ? (
          <video ref={videoRef} className="third-envelope__video" src={VIDEO_FILE} playsInline preload="auto" onEnded={finishVideo} onError={() => { setVideoError(true); finishVideo() }} />
        ) : (
          <div className="third-envelope__video-placeholder" role="img" aria-label="Відеозаглушка: на стіл кладуть матеріали експертиз">
            <div className="third-envelope__table-light" />
            <div className="third-envelope__paper third-envelope__paper--one"><span>ВИСНОВОК</span><b>СУДОВО-МЕДИЧНА ЕКСПЕРТИЗА</b><small>№ 102/26</small></div>
            <div className="third-envelope__paper third-envelope__paper--two"><span>ЕКСПЕРТНЕ ДОСЛІДЖЕННЯ</span><b>АВТОТЕХНІЧНА ЕКСПЕРТИЗА</b><small>МАТЕРІАЛИ СПРАВИ</small></div>
            <div className="third-envelope__hand-shadow" />
            <div className="third-envelope__placeholder-caption">НОВІ МАТЕРІАЛИ НАДІЙШЛИ</div>
          </div>
        )}
      </div>

      {videoFinished && (
        <div className="third-envelope__content">
          <div className="third-envelope__eyebrow"><span>КОНВЕРТ № 3</span><span>РЕЗУЛЬТАТИ ЕКСПЕРТИЗ</span></div>
          <h1>Картина змінюється</h1>
          {!opening ? (
            <div className="third-envelope__assistant">
              <div className="third-envelope__avatar">М</div>
              <div>
                <div className="third-envelope__speaker">НАПАРНИК <small>ВАШ ПОМІЧНИК У РОЗСЛІДУВАННІ</small></div>
                <p>Результати експертизи досить цікаві… Я ж казав, що тут щось не так. Ви теж це помітили?</p>
                <div className="third-envelope__actions">
                  <button onClick={() => { setNoticed(true); setOpening(true) }}>Так, дещо тут справді не сходиться.</button>
                  <button className="is-quiet" onClick={() => { setNoticed(false); setOpening(true) }}>Ні, а що саме вас насторожило?</button>
                </div>
              </div>
            </div>
          ) : noticed === false ? (
            <div className="third-envelope__assistant third-envelope__assistant--follow">
              <div className="third-envelope__avatar">М</div>
              <div>
                <div className="third-envelope__speaker">НАПАРНИК</div>
                <p>Тоді ще раз уважно подивіться висновок судово-медичного експерта. Особливо зверніть увагу на причину смерті та час утворення ушкоджень.</p>
                <button className="third-envelope__back-choice" onClick={() => { setOpening(false); setNoticed(null) }}>Повернутися до запитання</button>
              </div>
            </div>
          ) : (
            <>
              <div className="third-envelope__assistant third-envelope__assistant--follow">
                <div className="third-envelope__avatar">М</div>
                <div>
                  <div className="third-envelope__speaker">НАПАРНИК</div>
                  <p>Тоді які наші наступні дії? Що робимо зі справою?</p>
                </div>
              </div>
              {!selected ? (
                <div className="third-envelope__choices">
                  {choices.map((item) => (
                    <button key={item.id} className="third-envelope__choice" onClick={() => choose(item.id)}>
                      <span>{item.id}</span><p>{item.text}</p><b>→</b>
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
                    <div><div className="third-envelope__speaker">НАПАРНИК</div><p>{choice.reply}</p></div>
                  </div>
                  <div className="third-envelope__question">
                    <h2>{choice.question}</h2>
                    {choice.answers.map((answer) => (
                      <button key={answer.id} className={`third-envelope__answer ${answerId === answer.id ? "is-selected" : ""}`} onClick={() => { setAnswerId(answer.id); setShowFeedback(false) }}>
                        <span>{answer.id.slice(-1).toUpperCase()}</span>{answer.text}
                      </button>
                    ))}
                    {showFeedback && selectedAnswer && (
                      <div className={`third-envelope__feedback ${selectedAnswer.correct ? "is-correct" : ""}`}>
                        <p>{selectedAnswer.feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="third-envelope__decision-footer">
                    <button className="is-quiet" onClick={resetChoice}>← Інше рішення</button>
                    {!showFeedback ? (
                      <button disabled={!answerId} onClick={submitAnswer}>Відповісти</button>
                    ) : selectedAnswer?.correct && selected === "D" ? (
                      <button onClick={continueFromDecision}>Продовжити розслідування →</button>
                    ) : (
                      <button onClick={resetChoice}>Повернутися до рішень</button>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}

      <footer className="third-envelope__footer">
        {onBack && <button className="is-quiet" onClick={onBack}>← Назад до етапу 2</button>}
        <span>ДОСЬЄ № 12026170010000456 · КОНВЕРТ 03</span>
        {videoFinished && selected === "D" && showFeedback && selectedAnswer?.correct && <span className="third-envelope__ready">РІШЕННЯ ЗАФІКСОВАНО</span>}
      </footer>
    </section>
  )
}
