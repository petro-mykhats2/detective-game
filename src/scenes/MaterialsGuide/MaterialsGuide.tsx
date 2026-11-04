import { useMemo, useState } from "react"

type Fact = { id: string; label: string; kind: string; text: string; source: string }
type Section = { id: string; label: string; facts: Fact[] }
type DocumentItem = { id: string; title: string; subtitle: string; sections: Section[] }

const documents: DocumentItem[] = [
  {
    id: "forensic",
    title: "Акт судово-медичного дослідження № 102/26",
    subtitle: "Обласне бюро судово-медичної експертизи · 07–08.07.2026",
    sections: [
      { id: "time", label: "Час та обставини дослідження", facts: [
        { id: "time1", label: "Час початку та завершення", kind: "Реквізити документа", text: "Дослідження розпочато 07.07.2026 о 09:30 та завершено 08.07.2026 о 14:00.", source: "Акт № 102/26, вступна частина" },
        { id: "time2", label: "Орієнтовний час смерті", kind: "Висновок експерта", text: "У документі наведено орієнтовний час смерті — 22:40–22:50 06.07.2026.", source: "Акт № 102/26, висновкова частина" }
      ]},
      { id: "injuries", label: "Виявлені тілесні ушкодження", facts: [
        { id: "inj1", label: "Ушкодження голови", kind: "Опис спостереження", text: "Описано тім’яну рану розміром 4 × 1,5 см та втиснений перелом тім’яної кістки.", source: "Акт № 102/26, дослідницька частина" },
        { id: "inj2", label: "Ушкодження грудної клітки", kind: "Опис спостереження", text: "Описано множинні переломи ребер з обох боків, 3–8.", source: "Акт № 102/26, дослідницька частина" },
        { id: "inj3", label: "Ознаки крововтрати", kind: "Опис спостереження", text: "У документі зазначено відсутність ознак гострої крововтрати та асфіксії.", source: "Акт № 102/26, дослідницька частина" }
      ]},
      { id: "tests", label: "Додаткові дослідження та висновки", facts: [
        { id: "tox", label: "Токсикологічне дослідження", kind: "Результат дослідження", text: "У досліджених зразках не виявлено етилового алкоголю, наркотичних і психотропних речовин.", source: "Акт № 102/26, результати токсикології" },
        { id: "cause", label: "Причина смерті", kind: "Висновок експерта", text: "Причиною смерті визначено відкриту черепно-мозкову травму з втисненим переломом тім’яної кістки та масивним крововиливом у мозок.", source: "Акт № 102/26, висновок" },
        { id: "mechanism", label: "Механізм травми голови", kind: "Висновок експерта", text: "Експерт пов’язує смертельне ушкодження з дією тупого твердого предмета. У документі наведено можливі приклади предметів.", source: "Акт № 102/26, висновок" },
        { id: "ribs", label: "Характер переломів ребер", kind: "Висновок експерта", text: "Переломи ребер у висновку пов’язані з дорожньо-транспортною пригодою та охарактеризовані як посмертні.", source: "Акт № 102/26, висновок" }
      ]}
    ]
  },
  {
    id: "vehicle",
    title: "Висновок експерта № 142/26-АВТО (V3)",
    subtitle: "Дністровський НДЕКЦ · 15.07.2026",
    sections: [
      { id: "vehicle", label: "Ідентифікація та огляд автомобіля", facts: [
        { id: "car", label: "Автомобіль", kind: "Об’єкт дослідження", text: "Білий Volkswagen Passat B7 Variant, державний номер ВІ 7741 СТ.", source: "Висновок № 142/26-АВТО, об’єкт дослідження" },
        { id: "damage", label: "Пошкодження задньої частини", kind: "Опис спостереження", text: "Зафіксовано деформації заднього бампера та кришки багажника.", source: "Висновок № 142/26-АВТО, результати огляду" },
        { id: "paint", label: "Сторонні мікрочастинки фарби", kind: "Результат дослідження", text: "Виявлено темні мікрошари фарби, які за описом експерта не відповідають білому лакофарбовому покриттю дослідженого автомобіля.", source: "Висновок № 142/26-АВТО, результати дослідження" }
      ]},
      { id: "mechanics", label: "Технічний стан та положення органів керування", facts: [
        { id: "gear", label: "Положення важеля КПП", kind: "Опис спостереження та висновок", text: "Важіль механічної коробки передач перебував у нейтральному положенні. Експерт зазначає, що ознак перемикання важеля в нейтраль під час падіння не виявлено; положення було обране до падіння.", source: "Висновок № 142/26-АВТО, дослідження КПП" },
        { id: "belt", label: "Ремінь безпеки водія", kind: "Опис спостереження та висновок", text: "Язичок замка ременя був зафіксований. Водночас не виявлено описаних експертом динамічних слідів навантаження; у висновку зазначено, що ремінь був застебнутий на тілі вже померлої особи.", source: "Висновок № 142/26-АВТО, дослідження ременя" }
      ]},
      { id: "traces", label: "Сліди та вилучені об’єкти", facts: [
        { id: "prints", label: "Відбитки пальців", kind: "Результат дослідження", text: "Описано сліди на дверях пасажира, панелі приладів, кермі, важелі КПП та ручці дверей водія. На момент цього висновку порівняльні зразки не були надані, тому особу за ними не встановлено.", source: "Висновок № 142/26-АВТО, дактилоскопічні сліди" },
        { id: "hair", label: "Волосся", kind: "Вилучені об’єкти", text: "Вилучено коротке темне волосся з підголівника водія (Safe Pack № 1) та довге світле/фарбоване волосся з переднього пасажирського сидіння (Safe Pack № 2). Матеріали запаковано для ДНК-дослідження.", source: "Висновок № 142/26-АВТО, біологічні сліди" },
        { id: "effects", label: "Особисті речі", kind: "Вилучені об’єкти", text: "Перелічено пошкоджений смартфон 0456-TEL, окуляри 0456-ACC, чорний шкіряний гаманець 0456-WAL та ключі 0456-KEY.", source: "Висновок № 142/26-АВТО, перелік вилученого" }
      ]}
    ]
  }
]

const kindClass = (kind: string) => kind.toLowerCase().replaceAll(" ", "-")

export default function MaterialsGuide({ onBack }: { onBack: () => void }) {
  const [documentId, setDocumentId] = useState(documents[0].id)
  const [sectionId, setSectionId] = useState(documents[0].sections[0].id)
  const [factId, setFactId] = useState(documents[0].sections[0].facts[0].id)
  const [notes, setNotes] = useState(() => {
    try { return localStorage.getItem("detective-material-guide-notes-v1") ?? "" } catch { return "" }
  })
  const doc = documents.find(item => item.id === documentId) ?? documents[0]
  const section = doc.sections.find(item => item.id === sectionId) ?? doc.sections[0]
  const fact = section.facts.find(item => item.id === factId) ?? section.facts[0]
  const totalFacts = useMemo(() => documents.reduce((sum, item) => sum + item.sections.reduce((s, part) => s + part.facts.length, 0), 0), [])

  function changeDocument(id: string) {
    const next = documents.find(item => item.id === id) ?? documents[0]
    setDocumentId(id); setSectionId(next.sections[0].id); setFactId(next.sections[0].facts[0].id)
  }
  function changeSection(id: string) {
    const next = doc.sections.find(item => item.id === id) ?? doc.sections[0]
    setSectionId(id); setFactId(next.facts[0].id)
  }
  function saveNotes(value: string) {
    setNotes(value)
    try { localStorage.setItem("detective-material-guide-notes-v1", value) } catch { /* local storage unavailable */ }
  }

  return <main className="materials-guide">
    <style>{`
      .materials-guide{min-height:100vh;background:#0d1114;color:#e9e5dc;padding:clamp(20px,4vw,54px);font-family:inherit}
      .mg-wrap{max-width:1120px;margin:0 auto}.mg-top{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:1px solid #343a3b;padding-bottom:18px;margin-bottom:38px;color:#a7aaa4;font-size:11px;letter-spacing:.16em}
      .mg-top i,.mg-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#c6a46a;margin-right:9px}
      .mg-back{background:transparent;border:1px solid #555b59;color:#ddd8cc;padding:10px 15px;cursor:pointer;letter-spacing:.08em;font:inherit;font-size:11px}
      .mg-kicker{color:#c6a46a;font-size:11px;letter-spacing:.2em;margin-bottom:12px}.mg-title{font-family:Georgia,serif;font-weight:400;font-size:clamp(34px,5vw,58px);margin:0 0 12px}.mg-lead{color:#aeb2ac;max-width:720px;line-height:1.7;margin-bottom:32px}
      .mg-panel{background:#171d20;border:1px solid #343c3e;padding:clamp(18px,3vw,30px);margin:18px 0}.mg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .mg-field label{display:block;color:#a9aaa2;font-size:10px;letter-spacing:.14em;margin-bottom:9px}.mg-field select{width:100%;background:#0f1518;color:#eee9df;border:1px solid #485052;padding:13px 38px 13px 12px;font:inherit;font-size:14px;min-height:48px}
      .mg-docline{color:#c6a46a;font-size:11px;letter-spacing:.08em;margin:20px 0 0}.mg-section-title{font:24px Georgia,serif;margin:0 0 18px}.mg-fact{border-left:2px solid #c6a46a;padding:4px 0 4px 18px;margin:18px 0}.mg-fact h3{font:22px Georgia,serif;margin:9px 0}.mg-fact p{color:#d0d0c8;line-height:1.75;margin:0 0 13px}.mg-source{color:#969e9b;font-size:11px;letter-spacing:.04em}.mg-tag{display:inline-block;border:1px solid #59615f;color:#c6c9c0;padding:5px 8px;font-size:10px;letter-spacing:.1em;text-transform:uppercase}
      .mg-warning{border:1px solid #66563d;background:#211e18;color:#cfc1a7;padding:14px 16px;line-height:1.6;font-size:13px;margin-top:20px}.mg-notes{width:100%;box-sizing:border-box;background:#0f1518;color:#eee9df;border:1px solid #485052;padding:14px;font:inherit;line-height:1.6;min-height:130px;resize:vertical}.mg-small{font-size:11px;color:#9ca29d;margin-top:10px}
      @media(max-width:720px){.mg-grid{grid-template-columns:1fr}.mg-top{align-items:flex-start}.mg-title{line-height:1.08}.mg-panel{padding:17px}}
    `}</style>
    <div className="mg-wrap">
      <div className="mg-top"><span><i/> ЦИФРОВИЙ СУПРОВІД РОЗСЛІДУВАННЯ · СПРАВА № 12026170010000456</span><button className="mg-back" onClick={onBack}>← НАЗАД ДО ТЕРМІНАЛА</button></div>
      <div className="mg-kicker">РОБОЧИЙ ІНСТРУМЕНТ СЛІДЧОГО</div>
      <h1 className="mg-title">Орієнтування в матеріалах справи</h1>
      <p className="mg-lead">Оберіть документ, потрібний розділ і конкретний пункт. Сторінка допомагає знайти відомості в паперових матеріалах, але не формує за слідчого версій чи висновків.</p>
      <section className="mg-panel">
        <div className="mg-grid">
          <div className="mg-field"><label htmlFor="mg-doc">01 / ДОКУМЕНТ</label><select id="mg-doc" value={documentId} onChange={e=>changeDocument(e.target.value)}>{documents.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
          <div className="mg-field"><label htmlFor="mg-section">02 / РОЗДІЛ</label><select id="mg-section" value={sectionId} onChange={e=>changeSection(e.target.value)}>{doc.sections.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
          <div className="mg-field"><label htmlFor="mg-fact">03 / ПУНКТ АБО ФРАГМЕНТ</label><select id="mg-fact" value={factId} onChange={e=>setFactId(e.target.value)}>{section.facts.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}</select></div>
        </div>
        <div className="mg-docline">{doc.subtitle} · {totalFacts} довідкових фрагментів у каталозі</div>
      </section>
      <section className="mg-panel" aria-live="polite">
        <div className="mg-kicker">ОБРАНИЙ ФРАГМЕНТ</div>
        <h2 className="mg-section-title">{section.label}</h2>
        <article className="mg-fact">
          <span className="mg-tag">{fact.kind}</span>
          <h3>{fact.label}</h3>
          <p>{fact.text}</p>
          <div className="mg-source">ДЖЕРЕЛО: {fact.source}</div>
        </article>
        <div className="mg-warning">Довідковий переказ не замінює оригінал. Перед використанням відомостей у грі звірте формулювання з відповідним пунктом паперового документа. Опис факту та висновок експерта — різні типи інформації.</div>
      </section>
      <section className="mg-panel">
        <div className="mg-kicker">ОСОБИСТІ РОБОЧІ ЗАПИСИ</div>
        <h2 className="mg-section-title">Мої нотатки</h2>
        <textarea className="mg-notes" value={notes} onChange={e=>saveNotes(e.target.value)} placeholder="Записуйте власні спостереження, питання та версії. Відокремлюйте підтверджені факти від припущень."/>
        <div className="mg-small">Нотатки автоматично зберігаються локально в цьому браузері на цьому пристрої.</div>
      </section>
    </div>
  </main>
}
