import { useEffect, useRef, useState } from "react"
import "./StageFour.css"

const chiefMessages = [
  "Марченко, доповідь отримав. Молодець, що протиснув експертизи.",
  "Отже, маємо вбивство: СМЕ дала вдавлений перелом від удару тупим, а автотехніки підтвердили таран і ремінь на труп.",
  "Міняємо кваліфікацію в ЄРДР на ч. 1 ст. 115 (умисне). Підтримку групи гарантую.",
  "Як дієш далі?",
]

type Choice = { label: string; reply: string; secondReply?: string }

const choices: Choice[] = [
  {
    label:
      "Терміново виїжджаю з обшуком на дачу у С/Т «Зелений Гай», оскільки за білінгом Cell ID 4598 телефон вимкнувся саме там о 22:45. Паралельно призначаю експертизи, викликаю на допит всіх хто контактував з Ковальчуком у день вбивства",
    reply:
      "Чудовий, вичерпний план! Бачу, ти детально опрацював усі суперечності в матеріалах. Дій послідовно, документуй кожну дрібницю та доповідай про перебіг обшуку. Успіху, Марченку, розкрути цю справу!",
  },
  {
    label:
      "Зараз уважно перечитаю всі протоколи допитів і висновки експертів, а вже потім сформую конкретні доручення оперативникам.",
    reply:
      "Розумно. Спочатку зістав усі факти та розбіжності в документах — від білінгу до банківських виписок, а вже потім давай завдання оперативній групі. Головне — не пропусти жодної дрібниці.",
  },
  {
    label: "П'ю каву, шефе, їм булочку і, може, почну сьогодні... 🤔🫡",
    reply: "Працюй давай, жартівник. 👍",
    secondReply: "Час йде, швидше! Бери людей і погнав!!! 🚓",
  },
]
type ChatMessage = { id: string; from: "chief" | "me"; text: string }

export default function StageFour({
  onComplete,
}: {
  onComplete: () => void
}) {
  const [visibleChiefMessages] = useState(chiefMessages.length)
  const [choice, setChoice] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [secondReplyVisible, setSecondReplyVisible] = useState(false)
  const [typing, setTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const secondReplyTimer = useRef<number | null>(null)
  const notificationSound = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    return () => {
      if (secondReplyTimer.current !== null) {
        window.clearTimeout(secondReplyTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    const chat = chatRef.current
    if (chat) chat.scrollTop = chat.scrollHeight
  }, [messages, typing])

  function choose(index: number) {
    if (choice !== null || visibleChiefMessages < chiefMessages.length) return

    const selected = choices[index]
    setChoice(index)
    setSecondReplyVisible(false)
    setMessages([
      { id: `me-${index}`, from: "me", text: selected.label },
      { id: `chief-${index}`, from: "chief", text: selected.reply },
    ])

    if (notificationSound.current) {
      notificationSound.current.currentTime = 0
      void notificationSound.current.play().catch(() => {})
    }

    if (selected.secondReply) {
      setTyping(true)
      secondReplyTimer.current = window.setTimeout(() => {
        setTyping(false)
        setSecondReplyVisible(true)
      }, 2000)
    }
  }

  return (
    <main className="stage-four" aria-label="Етап 4: службовий чат">
      <div className="stage-four__phone">
        <header className="stage-four__statusbar">
          <span>09:41</span>
          <span>СЛУЖБОВИЙ КАНАЛ</span>
          <span>● ● ●</span>
        </header>

        <header className="stage-four__chat-header">
          <div className="stage-four__avatar">Н</div>
          <div className="stage-four__contact">
            <strong>Начальник слідчого підрозділу</strong>
            <span>службовий канал · онлайн</span>
          </div>
          <div className="stage-four__header-mark">⋯</div>
        </header>

        <div className="stage-four__chat" ref={chatRef}>
          <div className="stage-four__date">СЬОГОДНІ</div>

          {Array.from({ length: visibleChiefMessages }).map((_, index) => (
            <div
              className="stage-four__bubble stage-four__bubble--chief"
              key={`chief-${index}`}
            >
              <p>{chiefMessages[index]}</p>
              <span>начальник · 09:4{index + 1}</span>
            </div>
          ))}

          {choice !== null &&
            messages.map((message) => (
              <div
                className={`stage-four__bubble stage-four__bubble--${message.from}`}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>
                  {message.from === "me" ? "ви · щойно" : "начальник · щойно"}
                </span>
              </div>
            ))}

          {typing && (
            <div className="stage-four__typing-bubble">
              <span className="stage-four__typing-avatar">Н</span>
              <span className="stage-four__typing-text">друкує</span>
              <span className="stage-four__typing-dots">
                <i />
                <i />
                <i />
              </span>
            </div>
          )}

          {choice !== null &&
            secondReplyVisible &&
            choices[choice].secondReply && (
              <div className="stage-four__bubble stage-four__bubble--chief">
                <p>{choices[choice].secondReply}</p>
                <span>начальник · щойно</span>
              </div>
            )}

          {choice === null && visibleChiefMessages >= chiefMessages.length && (
            <div className="stage-four__typing">
              Начальник очікує на відповідь…
            </div>
          )}
        </div>

        <div className="stage-four__composer">
          {choice === null ? (
            <>
              <div className="stage-four__composer-label">ВАША ВІДПОВІДЬ</div>
              <div className="stage-four__choices">
                {choices.map((item, index) => (
                  <button key={item.label} onClick={() => choose(index)}>
                    <span>{index + 1}</span>
                    <strong>{item.label}</strong>
                    <b>›</b>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="stage-four__composer-done">
              {typing ? "Начальник друкує відповідь…" : "Відповідь надіслано"}
            </div>
          )}
        </div>

        <button
          className="stage-four__next"
          onClick={onComplete}
          disabled={choice === null || typing}
        >
          Закінчити листування і відкрити конверт 04 <span aria-hidden="true">→</span>
        </button>
      </div>
      <audio ref={notificationSound} src="/audio/message-notification.mp3" preload="auto" />
    </main>
  )
}
