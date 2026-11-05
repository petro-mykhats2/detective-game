import { useEffect, useRef, useState } from "react"
import "./StageFour.css"

const VOICE = "/audio/chief-stage-four-response.mp3"
const chiefMessages = [
  "Капітане, доповідь отримав. Ти добре попрацював.",
  "Сукупність установлених обставин дає достатні підстави перевіряти версію умисного вбивства. Це вже не можна розглядати лише як звичайну дорожньо-транспортну пригоду.",
  "Кваліфікацію справи змінено на умисне вбивство. Я забезпечу необхідне сприяння для подальшого розслідування.",
  "Відтепер кожен крок має бути обґрунтований матеріалами справи. Розраховую на тебе."
]
const choices = [
  { label: "Зрозумів. Починаю невідкладні перевірки.", reply: "Добре. Дій послідовно й документуй кожну встановлену обставину. Якщо з’являться нові дані — доповідай одразу." },
  { label: "Хочу уточнити першочергові дії.", reply: "Почни з перевірки обставин, які не узгоджуються з версією ДТП. Зістав висновки експертів, показання та цифрові дані." },
  { label: "Прошу забезпечити додаткову підтримку слідчої групи.", reply: "Забезпечу необхідне сприяння. Узгоджу залучення оперативних працівників і фахівців у межах їхніх повноважень." }
]
type ChatMessage = { id: string; from: "chief" | "me"; text: string }

export default function StageFour() {
  const [playing, setPlaying] = useState(false)
  const [finished, setFinished] = useState(false)
  const [visibleChiefMessages, setVisibleChiefMessages] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const chatRef = useRef<HTMLDivElement>(null)
  const voice = useRef<HTMLAudioElement>(null)
  const oldMusicVolume = useRef<number | null>(null)
  const voiceFrame = useRef<number | null>(null)
  const musicFrame = useRef<number | null>(null)
  const voiceFadeOutStarted = useRef(false)

  function fade(audio: HTMLAudioElement, target: number, ms: number, frameRef: { current: number | null }, done?: () => void) {
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
    voiceFadeOutStarted.current = false
    const bg = music()
    if (bg) {
      if (oldMusicVolume.current === null) oldMusicVolume.current = bg.volume
      fade(bg, 0.12, 900, musicFrame)
    }
    void audio.play().then(() => {
      setPlaying(true); setFinished(false); setLine(0); fade(audio, 1, 650, voiceFrame)
    }).catch(() => { setPlaying(false); setFinished(true); restoreMusic() })
  }
  useEffect(() => {
    const timer = window.setTimeout(playVoice, 600)
    return () => { window.clearTimeout(timer); stopVoice(); if (musicFrame.current !== null) cancelAnimationFrame(musicFrame.current) }
    // Сцена запускає озвучення лише один раз під час входу.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const audio = voice.current
    if (!audio || !playing) return
    const update = () => {
      if (audio.duration) {
        setLine(Math.min(lines.length - 1, Math.floor(audio.currentTime / audio.duration * lines.length)))
        if (!voiceFadeOutStarted.current && audio.duration - audio.currentTime <= 0.8) {
          voiceFadeOutStarted.current = true
          fade(audio, 0, 750, voiceFrame)
        }
      }
    }
    audio.addEventListener("timeupdate", update)
    return () => audio.removeEventListener("timeupdate", update)
  }, [playing])
  function choose(index: number) {
    if (choice !== null || visibleChiefMessages < chiefMessages.length) return
    setChoice(index)
    setMessages([
      { id: `me-${index}`, from: "me", text: choices[index].label },
      { id: `chief-${index}`, from: "chief", text: choices[index].reply },
    ])
    const audio = voice.current
    if (audio && !audio.paused) {
      fade(audio, 0, 300, voiceFrame, () => {
        audio.pause()
        audio.currentTime = 0
        setPlaying(false)
        restoreMusic()
      })
    } else {
      stopVoice()
    }
  }

  return (
    <main className="stage-four" aria-label="Етап 4: службовий чат">
      <div className="stage-four__phone">
        <header className="stage-four__statusbar"><span>09:41</span><span>СЛУЖБОВИЙ КАНАЛ</span><span>● ● ●</span></header>
        <header className="stage-four__chat-header">
          <div className="stage-four__avatar">Н</div>
          <div className="stage-four__contact">
            <strong>Начальник слідчого підрозділу</strong>
            <span>{playing ? "голосове повідомлення…" : "службовий канал · онлайн"}</span>
          </div>
          <div className="stage-four__header-mark">⋯</div>
        </header>

        <div className="stage-four__chat" ref={chatRef}>
          <div className="stage-four__date">СЬОГОДНІ</div>
          {Array.from({ length: visibleChiefMessages }).map((_, index) => (
            <div className="stage-four__bubble stage-four__bubble--chief" key={`chief-${index}`}>
              <p>{chiefMessages[index]}</p>
              <span>начальник · {index === visibleChiefMessages - 1 && playing ? "говорить" : `09:4${index + 1}`}</span>
            </div>
          ))}
          {choice !== null && messages.map((message) => (
            <div className={`stage-four__bubble stage-four__bubble--${message.from}`} key={message.id}>
              <p>{message.text}</p>
              <span>{message.from === "me" ? "ви · щойно" : "начальник · щойно"}</span>
            </div>
          ))}
          {choice === null && visibleChiefMessages >= chiefMessages.length && (
            <div className="stage-four__typing">Начальник очікує на відповідь…</div>
          )}
        </div>

        <div className="stage-four__composer">
          {choice === null ? (
            <>
              <div className="stage-four__composer-label">ВАША ВІДПОВІДЬ</div>
              <div className="stage-four__choices">
                {choices.map((item, index) => (
                  <button key={item.label} onClick={() => choose(index)}>
                    <span>{index + 1}</span><strong>{item.label}</strong><b>›</b>
                  </button>
                ))}
              </div>
            </>
          ) : <div className="stage-four__composer-done">Відповідь надіслано</div>}
        </div>

        <div className="stage-four__audio">
          <span>{playing ? "НАЧАЛЬНИК ГОВОРИТЬ" : finished ? "ЗВЕРНЕННЯ ЗАВЕРШЕНО" : "АУДІОЗВЕРНЕННЯ"}</span>
          <button disabled={playing} onClick={playVoice}>{playing ? "▶ Відтворюється…" : "↻ Прослухати ще раз"}</button>
        </div>
        <footer className="stage-four__footer"><span>ЕТАП 04</span><span>СПРАВА № 12026170010000456</span></footer>
      </div>
      <audio ref={voice} src={VOICE} preload="auto"
        onEnded={() => { setPlaying(false); setFinished(true); restoreMusic() }}
        onError={() => { setPlaying(false); setFinished(true); restoreMusic() }}
      />
    </main>
  )

}
