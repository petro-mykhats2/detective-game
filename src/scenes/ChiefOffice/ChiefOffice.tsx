type VoiceStatus = "loading" | "playing" | "finished" | "unavailable";

type ChiefOfficeProps = {
  lines: string[];
  voiceStatus: VoiceStatus;
  onContinue: () => void;
};

const statusText: Record<VoiceStatus, string> = {
  loading: "ПІДГОТОВКА ОЗВУЧЕННЯ",
  playing: "ОЗВУЧЕННЯ ВІДТВОРЮЄТЬСЯ",
  finished: "ОЗВУЧЕННЯ ЗАВЕРШЕНО",
  unavailable: "ТЕКСТОВИЙ РЕЖИМ · ПЕРЕВІРТЕ АУДІОФАЙЛ"
};

export default function ChiefOffice({ lines, voiceStatus, onContinue }: ChiefOfficeProps) {
  return (
    <section className="narration-screen" aria-label="Кабінет начальника">
      <div className="scene-topline">
        <span><i /> КАБІНЕТ НАЧАЛЬНИКА</span>
        <span>СПРАВА № 12026170010000456</span>
      </div>

      <div className="narration-panel" aria-live="polite">
        <div className="narration-kicker">
          <span>ПЕРЕДІСТОРІЯ СПРАВИ</span>
          <span>ВСТУП · 01</span>
        </div>
        <div className="narration-progress" aria-label="Вступна сцена">
          <span style={{ width: voiceStatus === "finished" ? "100%" : voiceStatus === "playing" ? "65%" : "8%" }} />
        </div>
        <div className="narration-text narration-text--all">
          {lines.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}
        </div>
        <div className="narration-bottom">
          <div className="voice-status"><i /> {statusText[voiceStatus]}</div>
          <button className="next-line-button" onClick={onContinue}>
            Перейти до матеріалів справи
            <span aria-hidden="true">→</span>
          </button>
        </div>
        {voiceStatus === "unavailable" && (
          <p className="audio-note">
            Не вдалося відтворити вступне аудіо. Текст доступний повністю, тому можна продовжити вручну. Перевірте, що файл лежить у public/audio/intro-01.mp3.mp3.
          </p>
        )}
      </div>
      <p className="narration-footnote">НЕ РОБІТЬ ВИСНОВКІВ, ПОКИ НЕ ПЕРЕВІРИЛИ ФАКТИ</p>
    </section>
  );
}
