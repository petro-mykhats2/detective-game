import { useEffect, useState } from "react";
import "./App.css";

const documents = [
  { id: "report", number: "01", title: "Рапорт про виявлення кримінального правопорушення", type: "Первинний документ провадження" },
  { id: "witness", number: "02", title: "Допит свідка Горбатюка", type: "Протокол допиту" },
  { id: "scene", number: "03", title: "Первинний огляд місця події", type: "Протокол огляду" },
];
const STORAGE_KEY = "detective-game-progress-v0.2";
type SavedState = { readIds: string[]; notes: Record<string, string> };
function loadState(): SavedState {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return { readIds: [], notes: {} };
    const parsed = JSON.parse(value);
    return {
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds.filter((id: string) => documents.some(d => d.id === id)) : [],
      notes: parsed.notes && typeof parsed.notes === "object" ? parsed.notes : {},
    };
  } catch { return { readIds: [], notes: {} }; }
}
export default function App() {
  const [saved, setSaved] = useState<SavedState>(loadState);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* storage unavailable */ } }, [saved]);
  const active = documents.find(d => d.id === activeId);
  function openDoc(id: string) {
    setSaved(s => ({ ...s, readIds: s.readIds.includes(id) ? s.readIds : [...s.readIds, id] }));
    setActiveId(id);
  }
  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">Д</div><div><div className="brand-title">ДЕТЕКТИВНА СПРАВА</div><div className="brand-subtitle">ІНТЕРАКТИВНИЙ РОБОЧИЙ ПРОСТІР СЛІДЧОГО</div></div></div>
      <div className="system-status"><span className="status-dot" /> ЛОКАЛЬНИЙ РЕЖИМ</div>
    </header>
    <section className="case-header">
      <div className="eyebrow">КРИМІНАЛЬНЕ ПРОВАДЖЕННЯ</div>
      <div className="case-title-row"><div><h1>Матеріали справи</h1><p className="case-number">№ 12026170010000456</p></div><div className="case-state"><span className="state-label">СТАТУС</span><span className="state-value">Первинне ознайомлення</span></div></div>
      <div className="rule-line" />
      <div className="progress-row"><div><div className="progress-label">ПЕРЕГЛЯНУТО ДОКУМЕНТІВ</div><div className="progress-count"><strong>{String(saved.readIds.length).padStart(2, "0")}</strong><span> / 03</span></div></div><div className="progress-track"><div className="progress-fill" style={{ width: `${saved.readIds.length / 3 * 100}%` }} /></div><div className="progress-note">Прогрес зберігається<br />у цьому браузері</div></div>
    </section>
    <section className="documents-section">
      <div className="section-heading"><div><div className="eyebrow">ЕТАП 01</div><h2>Початкові матеріали</h2></div><span className="document-count">03 ДОКУМЕНТИ</span></div>
      <p className="section-intro">Ознайомтеся з наявними матеріалами. Фіксуйте власні спостереження окремо від установлених фактів.</p>
      <div className="document-list">{documents.map(doc => {
        const read = saved.readIds.includes(doc.id), hasNote = Boolean(saved.notes[doc.id]?.trim());
        return <button className="document-card" key={doc.id} onClick={() => openDoc(doc.id)}><div className="document-number">{doc.number}</div><div className="document-main"><div className="document-type">{doc.type}</div><h3>{doc.title}</h3><div className="document-meta"><span className={read ? "read-status read" : "read-status"}><span className="mini-dot" />{read ? "Відкривався" : "Ще не відкривався"}</span>{hasNote && <span className="note-status">✎ Є нотатка</span>}</div></div><div className="document-arrow">↗</div></button>;
      })}</div>
    </section>
    <footer className="app-footer"><span className="footer-mark">Д / С</span><p>Робочі нотатки — це ваші спостереження, а не автоматично встановлені факти.</p><span>ВЕРСІЯ 0.2</span></footer>
    {active && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setActiveId(null); }}><section className="document-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-topline"><span>ДОКУМЕНТ {active.number} / 03</span><button className="close-button" onClick={() => setActiveId(null)} aria-label="Закрити">×</button></div>
      <div className="modal-document-heading"><div className="eyebrow">МАТЕРІАЛИ ПРОВАДЖЕННЯ</div><h2 id="modal-title">{active.title}</h2></div>
      <div className="source-placeholder"><div className="placeholder-symbol">▤</div><div><strong>Оригінальний текст документа ще не підключено</strong><p>Текст не відтворюється автоматично, щоб не вигадувати зміст і не підміняти оригінальні матеріали справи.</p></div></div>
      <label className="notes-label" htmlFor="document-notes">МОЇ НОТАТКИ ДО ДОКУМЕНТА</label>
      <textarea id="document-notes" value={saved.notes[active.id] ?? ""} onChange={e => setSaved(s => ({ ...s, notes: { ...s.notes, [active.id]: e.target.value } }))} placeholder="Запишіть спостереження, запитання або можливі версії. Нотатки не вважаються встановленими фактами." rows={5} />
      <div className="modal-bottom"><span className="autosave"><span className="status-dot" /> Автозбереження увімкнено</span><button className="done-button" onClick={() => setActiveId(null)}>Повернутися до матеріалів <span>→</span></button></div>
    </section></div>}
  </main>;
}
