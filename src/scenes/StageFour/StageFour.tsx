import { useEffect, useRef, useState } from "react"
import "./StageFour.css"

const VOICE = "/audio/chief-stage-four-response.mp3"
const lines = [
  "Капітане, доповідь отримав. Ти добре попрацював.",
  "Сукупність установлених обставин дає достатні підстави перевіряти версію умисного вбивства. Це вже не можна розглядати лише як звичайну дорожньо-транспортну пригоду.",
  "Я ініціюю зміну правової кваліфікації провадження за ознаками умисного вбивства. Забезпечу необхідне сприяння та доручу підрозділу підтримати твою роботу.",
  "Відтепер кожен крок має бути обґрунтований матеріалами справи. Не поспішай із висновками, але й не втрачай часу. Розраховую на тебе."
]
const choices = [
  { label: "Зрозумів. Починаю невідкладні перевірки.", reply: "Добре. Дій послідовно й документуй кожну встановлену обставину. Якщо з’являться нові дані — доповідай одразу.", note: "Доручення прийнято. Слідчий продовжує роботу за новою версією." },
  { label: "Перш ніж почати, хочу уточнити першочергові дії.", reply: "Почни з перевірки обставин, які не узгоджуються з версією ДТП. Зістав висновки експертів, показання та цифрові дані. Черговість дій визначай за доказами й процесуальними підставами.", note: "Начальник уточнив загальний напрям роботи. Конкретні слідчі дії потребують належних підстав." },
  { label: "Прошу забезпечити додаткову підтримку слідчої групи.", reply: "Забезпечу необхідне сприяння. Узгоджу залучення оперативних працівників і фахівців у межах їхніх повноважень.", note: "Запит на підтримку зафіксовано. Питання залучення додаткових працівників буде опрацьовано." }
]

export default function StageFour() {
  const [playing, setPlaying] = useState(false)
  const [finished, setFinished] = useState(false)
  const [line, setLine] = useState(-1)
  const [choice, setChoice] = useState<number | null>(null)
  const voice = useRef<HTMLAudioElement>(null)
  const oldMusicVolume = useRef<number | null>(null)
  const voiceFrame = useRef<number | null>(null)
  const musicFrame = useRef<number | null>(null)

  function fade(audio: HTMLAudioElement, target: number, ms: number, frameRef: React.MutableRefObject<number | null>, done?: () => void) {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    const start = audio.volume
    const began = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - began) / ms)
      audio.volume = start + (target - start) * p * p * (3 - 2 * p)
      if (p < 1) frameRef.current = requestAnimationFrame(tick)
      else { frameRef.current = null; done?.() }
    }
    frameRef.current = requestAnimationFrame(tick)
  }
  function music() {
    return document.querySelector('audio[src="/investigation-theme.mp3"]') as HTMLAudioElement | null
  }
  function restoreMusic() {
    const bg = music()
    if (bg && oldMusicVolume.current !== null) {
      fade(bg, oldMusicVolume.current, 1000, musicFrame)
      oldMusicVolume.current = null
    }
  }
  function stopVoice() {
    if (voiceFrame.current !== null) cancelAnimationFrame(voiceFrame.current)
    if (voice.current) { voice.current.pause(); voice.current.currentTime = 0; voice.current.volume = 0 }
    setPlaying(false)
    restoreMusic()
  }
  function playVoice() {
    if (!voice.current || playing) return
    const audio = voice.current
    audio.pause(); audio.currentTime = 0; audio.volume = 0
    setLine(0)
    const bg = music()
    if (bg) {
      if (oldMusicVolume.current === null) oldMusicVolume.current = bg.volume
      fade(bg, 0.12, 900, musicFrame)
    }
    void audio.play().then(() => {
      setPlaying(true); setFinished(false); setLine(0); fade(audio, 1, 650, voiceFrame)
    }).catch(() => { setPlaying(false); setLine(lines.length - 1); restoreMusic() })
  }
  useEffect(() => {
    const timer = window.setTimeout(playVoice, 600)
    return () => { window.clearTimeout(timer); stopVoice(); if (musicFrame.current !== null) cancelAnimationFrame(musicFrame.current) }
  }, [])
  useEffect(() => {
    const audio = voice.current
    if (!audio || !playing) return
    const update = () => {
      if (audio.duration) setLine(Math.min(lines.length - 1, Math.floor(audio.currentTime / audio.duration * lines.length)))
    }
    audio.addEventListener("timeupdate", update)
    return () => audio.removeEventListener("timeupdate", update)
  }, [playing])
  function choose(index: number) {
    if (choice !== null) return
    setChoice(index)
    const audio = voice.current
    if (audio && !audio.paused) fade(audio, 0, 300, voiceFrame, () => { audio.pause(); audio.currentTime = 0; setPlaying(false); restoreMusic() })
    else stopVoice()
  }
  return <main className="stage-four" aria-label="Етап 4: рішення начальника">
    <header className="stage-four__topline"><span><i /> СЛУЖБОВЕ ПОВІДОМЛЕННЯ</span><span>ЕТАП 04 · СПРАВА № 12026170010000456</span></header>
    {choice === null ? <section className="stage-four__panel">
      <div className="stage-four__kicker">ЗВ’ЯЗОК ІЗ НАЧАЛЬНИКОМ СЛІДЧОГО ПІДРОЗДІЛУ</div>
      <div className="stage-four__speaker"><b>Н</b><div><strong>НАЧАЛЬНИК СЛІДЧОГО ПІДРОЗДІЛУ</strong><span>{playing ? "ГОВОРИТЬ · З’ЄДНАННЯ АКТИВНЕ" : "СЛУЖБОВИЙ КАНАЛ ЗВ’ЯЗКУ"}</span></div></div>
      <h1>Твоя доповідь змінила хід справи.</h1>
      <div className="stage-four__message">{lines.map((s,i)=><p className={i<=line?"is-visible":""} key={s}>{s}</p>)}</div>
      <div className="stage-four__audio"><span>{playing?"НАЧАЛЬНИК ГОВОРИТЬ":finished?"ЗВЕРНЕННЯ ЗАВЕРШЕНО":"АУДІОЗВЕРНЕННЯ"}</span><button disabled={playing} onClick={playVoice}>{playing?"▶ Відтворюється…":"↻ Прослухати звернення"}</button></div>
      <div className="stage-four__choices"><label>ВАША ВІДПОВІДЬ НАЧАЛЬНИКУ</label>{choices.map((c,i)=><button key={c.label} onClick={()=>choose(i)}><span>0{i+1}</span><strong>{c.label}</strong><b>→</b></button>)}</div>
    </section> : <section className="stage-four__panel stage-four__response">
      <div className="stage-four__kicker">ПРОДОВЖЕННЯ СЛУЖБОВОЇ РОЗМОВИ</div>
      <div className="stage-four__speaker"><b>Н</b><div><strong>НАЧАЛЬНИК СЛІДЧОГО ПІДРОЗДІЛУ</strong><span>ВІДПОВІДЬ ОТРИМАНО</span></div></div>
      <h1>Рішення зафіксовано.</h1>
      <div className="stage-four__selected"><label>ВАША ВІДПОВІДЬ</label><p>{choices[choice].label}</p></div>
      <p className="stage-four__reply">{choices[choice].reply}</p>
      <div className="stage-four__note"><label>СЛУЖБОВА ВІДМІТКА</label><p>{choices[choice].note}</p></div>
      <div className="stage-four__end">КІНЕЦЬ ПОВІДОМЛЕННЯ · ЕТАП 04</div>
    </section>}
    <footer className="stage-four__footer"><span>ВНУТРІШНЄ КОРИСТУВАННЯ</span><span>ДОПОВІДЬ ПРИЙНЯТО · ПРОВАДЖЕННЯ № 12026170010000456</span></footer>
    <audio ref={voice} src={VOICE} preload="auto" onEnded={()=>{setPlaying(false);setFinished(true);restoreMusic()}} onError={()=>{setPlaying(false);restoreMusic()}} />
  </main>
}
