import { useEffect, useRef, useState } from "react";
import "./App.css";
import ChiefOffice from "./scenes/ChiefOffice/ChiefOffice";
import { introLines } from "./scenes/ChiefOffice/sceneData";

type Screen = "start" | "intro" | "handoff" | "terminal";

const BACKGROUND_IMAGE = "/background.jpeg";
const MUSIC_FILE = "/investigation-theme.mp3";
const INTRO_VOICE_FILE = "/audio/intro-01.mp3.mp3";

// Для всього вступу використовується один аудіофайл. Текст показується повністю,
// оскільки окремих аудіофрагментів або таймкодів синхронізації немає.

const NOTE_KEY = "detective-case-notes-v1";

export default function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"loading" | "playing" | "finished" | "unavailable">("loading");
  const [note, setNote] = useState(() => {
    try { return localStorage.getItem(NOTE_KEY) ?? ""; } catch { return ""; }
  });
  const musicRef = useRef<HTMLAudioElement>(null);
  const voiceRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const image = new Image();
    image.src = BACKGROUND_IMAGE;
  }, []);

  useEffect(() => {
    try { localStorage.setItem(NOTE_KEY, note); } catch { /* Збереження може бути недоступним у приватному режимі. */ }
  }, [note]);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;
    if (musicEnabled && screen !== "start") {
      void music.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
    } else {
      music.pause();
      if (screen === "start") music.currentTime = 0;
    }
  }, [musicEnabled, screen]);

  function beginInvestigation() {
    setVoiceStatus("loading");
    setScreen("intro");
    if (musicEnabled && musicRef.current) {
      void musicRef.current.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
    }

    const voice = voiceRef.current;
    if (!voice) {
      setVoiceStatus("unavailable");
      return;
    }
    voice.currentTime = 0;
    void voice.play().then(() => {
      setVoiceStatus("playing");
    }).catch(() => {
      // Якщо файл відсутній або браузер блокує звук, вступ лишається доступним як текст.
      setVoiceStatus("unavailable");
    });
  }

  function handleVoiceEnded() {
    setVoiceStatus("finished");
  }

  function continueToMaterials() {
    if (voiceRef.current) voiceRef.current.pause();
    setScreen("handoff");
  }

  async function toggleMusic() {
    const next = !musicEnabled;
    setMusicEnabled(next);
    if (next && musicRef.current && screen !== "start") {
      try {
        await musicRef.current.play();
        setAudioBlocked(false);
      } catch {
        setAudioBlocked(true);
      }
    }
  }

  return (
    <main className={`experience is-ready experience--${screen}`}>
      <div className="experience__background" style={{ backgroundImage: `url("${BACKGROUND_IMAGE}")` }} aria-hidden="true" />
      <div className="experience__shade" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />

      {screen === "start" && (
        <section className="intro" aria-label="Початок гри">
          <div className="intro__classification">КРИМІНАЛЬНЕ РОЗСЛІДУВАННЯ <span>///</span> ДОСЬЄ № 001</div>
          <div className="intro__center">
            <div className="intro__overline"><span /> КОЖНА ДЕТАЛЬ МАЄ ЗНАЧЕННЯ</div>
            <h1 className="intro__title">Детектив<span>.</span></h1>
            <p className="intro__subtitle">Істина прихована в деталях.</p>
            <button className="start-button" onClick={beginInvestigation}>
              <span>Почати розслідування</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
            </button>
          </div>
          <div className="intro__footer">
            <span>СИСТЕМА ГОТОВА ДО РОБОТИ</span>
            <span className="intro__footer-mark"><i /> CASE FILE / 001</span>
          </div>
        </section>
      )}

      {screen === "intro" && (
        <ChiefOffice
          lines={introLines}
          voiceStatus={voiceStatus}
          onContinue={continueToMaterials}
        />
      )}

      {screen === "handoff" && (
        <section className="handoff-screen" aria-label="Інструкція напарника">
          <div className="scene-topline"><span><i /> ПОВІДОМЛЕННЯ ВІД НАПАРНИКА</span><span>ЕТАП 01 · ПЕРВИННІ МАТЕРІАЛИ</span></div>
          <div className="handoff-card">
            <div className="assistant-mark">М</div>
            <div className="narration-kicker">КАПІТАНЕ МАРЧЕНКО, ДО УВАГИ</div>
            <h1>Почніть із матеріалів справи</h1>
            <p>Візьміть <strong>Конверт № 1</strong> із матеріалами справи та ознайомтеся з первинними документами: рапортом, протоколом допиту свідка Горбатюка та протоколом огляду місця події.</p>
            <p>Після вивчення зафіксуйте ключові факти у робочому терміналі. Не плутайте встановлені обставини з припущеннями.</p>
            <button className="start-button handoff-button" onClick={() => setScreen("terminal")}>
              <span>Відкрити робочий термінал</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        </section>
      )}

      {screen === "terminal" && (
        <section className="terminal-screen" aria-label="Робочий термінал">
          <div className="scene-topline"><span><i /> РОБОЧИЙ ТЕРМІНАЛ</span><span>СПРАВА № 12026170010000456</span></div>
          <div className="terminal-card">
            <div className="narration-kicker">ОСОБИСТІ НОТАТКИ СЛІДЧОГО</div>
            <h1>Зафіксуйте ключові факти</h1>
            <p className="terminal-instruction">Вивчіть документи з фізичного конверта № 1. Запишіть тут факти, які прямо підтверджені матеріалами, а питання та припущення позначайте окремо.</p>
            <label className="notes-label" htmlFor="case-notes">РОБОЧІ НОТАТКИ</label>
            <textarea id="case-notes" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Наприклад: що встановлено; хто повідомив про подію; які обставини потребують перевірки…" rows={7} />
            <div className="terminal-footer"><span><i /> Нотатки автоматично зберігаються в цьому браузері</span><button className="text-button" onClick={() => setScreen("handoff")}>До інструкції</button></div>
          </div>
        </section>
      )}

      {screen !== "start" && (
        <button className={`sound-toggle ${musicEnabled ? "is-on" : "is-off"}`} onClick={toggleMusic} aria-label={musicEnabled ? "Вимкнути фонову музику" : "Увімкнути фонову музику"} title={audioBlocked && musicEnabled ? "Браузер заблокував звук" : musicEnabled ? "Вимкнути музику" : "Увімкнути музику"}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" />{musicEnabled ? <><path d="M16 9a4 4 0 0 1 0 6" /><path d="M18.5 6.5a8 8 0 0 1 0 11" /></> : <path d="m16 9 5 6m0-6-5 6" />}</svg>
          <span>{audioBlocked && musicEnabled ? "ПЕРЕВІРИТИ ЗВУК" : musicEnabled ? "ЗВУК УВІМКНЕНО" : "ЗВУК ВИМКНЕНО"}</span>
        </button>
      )}

      <audio ref={musicRef} src={MUSIC_FILE} loop preload="auto" />
      <audio ref={voiceRef} src={INTRO_VOICE_FILE} onEnded={handleVoiceEnded} onError={() => setVoiceStatus("unavailable")} preload="auto" />
    </main>
  );
}
