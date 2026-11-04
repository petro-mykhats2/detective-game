import { useMemo, useState } from "react"

type Fact = { id: string; label: string; text: string; source: string; indicatesIntentionalMurder: boolean; explanation: string }
type Section = { id: string; label: string; facts: Fact[] }
type DocumentItem = { id: string; title: string; sections: Section[] }

const documents: DocumentItem[] = [
  {
    id: "medical",
    title: "Акт судово-медичної експертизи № 102/26",
    sections: [
      { id: "external", label: "II. Зовнішнє дослідження", facts: [
        { id: "clothing", label: "Стан одягу", text: "Повсякденний одяг; виявлено множинні розриви та плями бурого кольору, схожі на кров.", source: "Акт № 102/26 · Розділ II · Одяг", indicatesIntentionalMurder: false, explanation: "Це опис стану одягу. Сам по собі він не встановлює умисного позбавлення життя." },
        { id: "head-wound", label: "Забійна рана тім’яної ділянки", text: "Забійна рана розміром 4 × 1,5 см на тім’яній ділянці.", source: "Акт № 102/26 · Розділ II · Тілесні ушкодження", indicatesIntentionalMurder: false, explanation: "Рана є важливою обставиною, але її опис без висновку про механізм і час утворення ще не дає повної відповіді." },
        { id: "no-belt-marks", label: "Відсутність гематом від ременя", text: "Гематоми від натягу паска безпеки — відсутні.", source: "Акт № 102/26 · Розділ II · Тілесні ушкодження", indicatesIntentionalMurder: true, explanation: "У поєднанні з автотехнічним висновком про застібання ременя на вже мертве тіло це підтримує версію інсценування ДТП. Оцінюйте саме сукупність матеріалів." }
      ]},
      { id: "internal", label: "III. Внутрішнє дослідження", facts: [
        { id: "skull", label: "Перелом черепа та крововилив", text: "Вдавлений перелом тім’яної кістки під раною. Масивний субарахноїдальний крововилив.", source: "Акт № 102/26 · Розділ III · Череп та головний мозок", indicatesIntentionalMurder: false, explanation: "Це опис ушкодження. Його значення для версії визначається разом із висновком про прижиттєвий характер і механізм травми." },
        { id: "ribs", label: "Переломи ребер", text: "Множинні двосторонні переломи ребер (3–8); крововиливи у м’які тканини відсутні.", source: "Акт № 102/26 · Розділ III · Грудна клітка", indicatesIntentionalMurder: false, explanation: "У висновку ці переломи віднесено до ушкоджень, характерних для ДТП, і визначено як посмертні." }
      ]},
      { id: "conclusions", label: "V. Судово-медичний діагноз та висновки", facts: [
        { id: "premortem", label: "Прижиттєва смертельна травма голови", text: "Смертельна черепно-мозкова травма виникла за життя. Ушкодження, пов’язані з падінням автомобіля, мають посмертний характер.", source: "Акт № 102/26 · Розділ V · Медична оцінка та головний висновок", indicatesIntentionalMurder: true, explanation: "Це ключова ознака: смертельна травма була завдана до падіння автомобіля, отже саме падіння не пояснює причину смерті." },
        { id: "weapon", label: "Механізм утворення смертельної травми", text: "Смертельна травма тім’яної ділянки — від сильного цілеспрямованого удару тупим твердим предметом.", source: "Акт № 102/26 · Розділ V · Механізм утворення травм", indicatesIntentionalMurder: true, explanation: "Експерт описує цілеспрямований удар тупим предметом як механізм смертельної травми, що є ознакою насильницького нападу." },
        { id: "toxicology", label: "Результат токсикологічного дослідження", text: "Етиловий спирт, наркотичні та психотропні речовини не виявлено.", source: "Акт № 102/26 · Розділ IV · Хіміко-токсикологічне дослідження", indicatesIntentionalMurder: false, explanation: "Цей результат виключає виявлення перелічених речовин у зразках, але сам по собі не свідчить про умисне вбивство." }
      ]}
    ]
  },
  {
    id: "vehicle",
    title: "Висновок експерта № 142/26-АВТО (V3)",
    sections: [
      { id: "body", label: "II. Технічний стан кузова та трасологічний аналіз", facts: [
        { id: "forced-push", label: "Примусове виштовхування автомобіля", text: "Слідова картина свідчить про примусове виштовхування ТЗ у прірву іншим масивним транспортним засобом.", source: "Висновок № 142/26-АВТО · Розділ II · Експертний висновок", indicatesIntentionalMurder: true, explanation: "Висновок вказує на зовнішній силовий вплив іншого транспортного засобу, а не на звичайне самостійне падіння." },
        { id: "paint", label: "Сторонні нашарування лакофарбового покриття", text: "У зоні контактного пошкодження виявлено темні чужорідні мікронашарування ЛФП, які відрізняються від штатного білого покриття автомобіля.", source: "Висновок № 142/26-АВТО · Розділ II · Технічний стан кузова", indicatesIntentionalMurder: true, explanation: "Стороннє ЛФП у зоні силового контакту підтримує версію зіткнення з іншим транспортним засобом. Це слід перевіряти разом з іншими ознаками." },
        { id: "rear-damage", label: "Деформація задньої частини кузова", text: "Виявлено деформацію продавлювання в області заднього бампера та кришки багажного відділення.", source: "Висновок № 142/26-АВТО · Розділ II · Технічний стан кузова", indicatesIntentionalMurder: false, explanation: "Окремий опис деформації не встановлює механізм умисного виштовхування; для цього важливий повний трасологічний висновок." }
      ]},
      { id: "controls", label: "II. Аналіз органів управління та систем безпеки", facts: [
        { id: "neutral", label: "Нейтральне положення КПП до падіння", text: "Фіксатори важеля не мають слідів вибивання передачі під час падіння; це вказує на переведення КПП у нейтральне положення до моменту падіння ТЗ у прірву.", source: "Висновок № 142/26-АВТО · Розділ II · Положення важеля КПП", indicatesIntentionalMurder: true, explanation: "Положення нейтральної передачі було встановлене до падіння та унеможливлювало самостійний рух автомобіля під тягою двигуна. Це підозріла обставина в сукупності з іншими даними." },
        { id: "belt", label: "Ремінь безпеки застебнутий на вже мертве тіло", text: "Сукупність ознак свідчить про те, що пасок безпеки був застебнутий у замок на вже мертве тіло.", source: "Висновок № 142/26-АВТО · Розділ II · Важлива обставина", indicatesIntentionalMurder: true, explanation: "Це прямо вказує, що ремінь застебнули після смерті водія, що підтримує версію інсценування ДТП." }
      ]},
      { id: "traces", label: "III. Фіксація та вилучення супутніх речових доказів", facts: [
        { id: "fingerprints", label: "Виявлені сліди папілярних узорів", text: "Виявлено сліди рук на ручках пасажирських дверей, панелі приладів, кермі, важелі перемикання передач та ручці водійських дверей. Ідентифікація на цьому етапі не проводилась.", source: "Висновок № 142/26-АВТО · Розділ III · Дактилоскопічні сліди", indicatesIntentionalMurder: false, explanation: "Наявність слідів рук без встановлення їх належності не доводить причетність конкретної особи чи умисне вбивство." },
        { id: "hair", label: "Вилучене волосся", text: "Вилучено коротке темне волосся з підголівника водія та довге світле фарбоване волосся з переднього пасажирського сидіння; об’єкти направлено на ДНК-дослідження.", source: "Висновок № 142/26-АВТО · Розділ III · Біологічні об’єкти", indicatesIntentionalMurder: false, explanation: "Це біологічні об’єкти для подальшого дослідження. Результатів ДНК у цьому документі ще немає." },
        { id: "phone", label: "Особисті речі потерпілого", text: "Зафіксовано та опечатано розтрощений смартфон, окуляри, гаманець і ключі потерпілого.", source: "Висновок № 142/26-АВТО · Розділ III · Особисті речі", indicatesIntentionalMurder: false, explanation: "Перелік вилучених речей сам по собі не вказує на умисне вбивство." }
      ]},
      { id: "summary", label: "V. Підсумкові висновки", facts: [
        { id: "summary-impact", label: "Ознаки зовнішнього силового впливу", text: "Пошкодження задньої частини кузова та стороннє темне ЛФП можуть свідчити про зіштовхування стороннім транспортним засобом.", source: "Висновок № 142/26-АВТО · Розділ V · Пункт 2", indicatesIntentionalMurder: true, explanation: "Експерт прямо допускає зіткнення зі стороннім транспортним засобом; це підтримує версію примусового скидання автомобіля." }
      ]}
    ]
  }
]

type Pick = { documentId: string; sectionId: string; factId: string; answer: "yes" | "no" | "" }
const blankPick = (): Pick => ({ documentId: documents[0].id, sectionId: documents[0].sections[0].id, factId: documents[0].sections[0].facts[0].id, answer: "" })

export default function MaterialsGuide({ onBack, onSubmit }: { onBack: () => void; onSubmit?: (facts: string[]) => void }) {
  const [picks, setPicks] = useState<Pick[]>([blankPick()])
  const [submitted, setSubmitted] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const correctFacts = useMemo(() => {
    return picks.filter(p => {
      const doc = documents.find(d => d.id === p.documentId)
      const section = doc?.sections.find(s => s.id === p.sectionId)
      const fact = section?.facts.find(f => f.id === p.factId)
      return fact && p.answer === (fact.indicatesIntentionalMurder ? "yes" : "no") && fact.indicatesIntentionalMurder
    })
  }, [picks])
  const score = correctFacts.length
  const usedIds = new Set(picks.map(p => p.factId))
  const getFact = (pick: Pick) => documents.find(d => d.id === pick.documentId)?.sections.find(s => s.id === pick.sectionId)?.facts.find(f => f.id === pick.factId)
  const updatePick = (index: number, patch: Partial<Pick>) => setPicks(old => old.map((p, i) => i === index ? { ...p, ...patch, answer: patch.factId || patch.sectionId || patch.documentId ? "" : (patch.answer ?? p.answer) } : p))
  const changeDocument = (index: number, documentId: string) => {
    const doc = documents.find(d => d.id === documentId)!
    setPicks(old => old.map((p, i) => i === index ? { documentId, sectionId: doc.sections[0].id, factId: doc.sections[0].facts[0].id, answer: "" } : p))
  }
  const changeSection = (index: number, sectionId: string) => {
    const p = picks[index]
    const doc = documents.find(d => d.id === p.documentId)!
    const section = doc.sections.find(s => s.id === sectionId)!
    setPicks(old => old.map((item, i) => i === index ? { ...item, sectionId, factId: section.facts[0].id, answer: "" } : item))
  }
  const addPick = () => setPicks(old => [...old, blankPick()])
  const answered = picks.every(p => p.answer !== "")
  const submitFacts = () => {
    setSubmitted(true)
    onSubmit?.(correctFacts.map(p => getFact(p)?.text ?? "").filter(Boolean))
  }

  return <main className="materials-guide">
    <style>{`
      .materials-guide{min-height:100vh;background:#0d1114;color:#e9e5dc;padding:clamp(18px,4vw,48px);font-family:inherit}
      .mg-wrap{max-width:1120px;margin:0 auto}.mg-top{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:1px solid #343a3b;padding-bottom:18px;margin-bottom:34px;color:#a7aaa4;font-size:11px;letter-spacing:.13em}
      .mg-top i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#c6a46a;margin-right:9px}.mg-back,.mg-secondary{background:transparent;border:1px solid #555b59;color:#ddd8cc;padding:11px 15px;cursor:pointer;font:inherit;font-size:11px;letter-spacing:.06em}
      .mg-kicker{color:#c6a46a;font-size:10px;letter-spacing:.2em;margin-bottom:12px}.mg-title{font:400 clamp(34px,5vw,56px)/1.08 Georgia,serif;margin:0 0 12px}.mg-lead{color:#aeb2ac;max-width:760px;line-height:1.7;margin-bottom:28px}
      .mg-panel{background:#171d20;border:1px solid #343c3e;padding:clamp(16px,3vw,26px);margin:16px 0}.mg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}
      .mg-field label{display:block;color:#a9aaa2;font-size:10px;letter-spacing:.12em;margin-bottom:9px}.mg-field select{width:100%;background:#0f1518;color:#eee9df;border:1px solid #485052;padding:13px 34px 13px 11px;font:inherit;font-size:13px;min-height:48px}
      .mg-question{font:24px Georgia,serif;margin:0 0 14px}.mg-statement{border-left:2px solid #c6a46a;padding:3px 0 3px 16px;color:#d9d7cf;line-height:1.75}.mg-source{color:#9ca49f;font-size:11px;margin-top:13px}
      .mg-answer{display:flex;gap:10px;margin-top:20px}.mg-answer button,.mg-primary{border:1px solid #8c754e;background:#c6a46a;color:#111;padding:12px 22px;cursor:pointer;font:inherit;font-size:12px;letter-spacing:.08em}.mg-answer button.selected{background:#e6d0a7;box-shadow:0 0 0 2px #c6a46a}.mg-feedback{margin-top:15px;padding:13px 15px;background:#101619;border:1px solid #3c4848;color:#c9cec7;line-height:1.6;font-size:13px}.mg-feedback.good{border-color:#55735f}.mg-feedback.bad{border-color:#80634d}
      .mg-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.mg-score{font:24px Georgia,serif;color:#e4d0a9}.mg-muted{font-size:12px;color:#9da49f;line-height:1.6}.mg-success{border:1px solid #55735f;background:#17231c;padding:17px;margin-top:18px;line-height:1.6}.mg-report{border:1px solid #424a49;padding:15px;margin:12px 0;line-height:1.6}.mg-report strong{color:#e3d0a9}
      @media(max-width:760px){.mg-grid{grid-template-columns:1fr}.mg-top{align-items:flex-start;flex-direction:column}.mg-answer button{flex:1}}
    `}</style>
    <div className="mg-wrap">
      <div className="mg-top"><span><i/> СПРАВА № 12026170010000456 · АНАЛІЗ МАТЕРІАЛІВ</span><button className="mg-back" onClick={onBack}>← НАЗАД</button></div>
      {!submitted ? <>
        <div className="mg-kicker">АНАЛІТИЧНЕ ЗАВДАННЯ · ЕТАП 01</div>
        <h1 className="mg-title">Знайдіть ознаки умисного вбивства</h1>
        <p className="mg-lead">У матеріалах є як важливі для версії слідства обставини, так і нейтральні відомості. Оберіть документ, розділ і конкретний фрагмент. Потім визначте, чи вказує він на можливе умисне вбивство.</p>
        <div className="mg-score">Правильні факти: {score} · 1 бал за кожен</div>
        {picks.map((pick, index) => {
          const doc = documents.find(d => d.id === pick.documentId)!
          const section = doc.sections.find(s => s.id === pick.sectionId)!
          const fact = section.facts.find(f => f.id === pick.factId)!
          const duplicate = picks.some((p, i) => i !== index && p.factId === pick.factId && p.documentId === pick.documentId)
          const isCorrect = pick.answer !== "" && pick.answer === (fact.indicatesIntentionalMurder ? "yes" : "no") && fact.indicatesIntentionalMurder
          const isIncorrect = pick.answer !== "" && !isCorrect
          return <section className="mg-panel" key={index}>
            <div className="mg-kicker">ФАКТ ДЛЯ ПЕРЕВІРКИ · {String(index + 1).padStart(2,"0")}</div>
            <div className="mg-grid">
              <div className="mg-field"><label>01 / ДОКУМЕНТ</label><select value={pick.documentId} onChange={e=>changeDocument(index,e.target.value)}>{documents.map(d=><option value={d.id} key={d.id}>{d.title}</option>)}</select></div>
              <div className="mg-field"><label>02 / РОЗДІЛ</label><select value={pick.sectionId} onChange={e=>changeSection(index,e.target.value)}>{doc.sections.map(s=><option value={s.id} key={s.id}>{s.label}</option>)}</select></div>
              <div className="mg-field"><label>03 / ФРАГМЕНТ</label><select value={pick.factId} onChange={e=>updatePick(index,{factId:e.target.value})}>{section.facts.map(f=><option value={f.id} key={f.id} disabled={usedIds.has(f.id) && f.id !== pick.factId}>{f.label}</option>)}</select></div>
            </div>
            <div className="mg-report"><div className="mg-kicker">ОБРАНИЙ ФРАГМЕНТ</div><p className="mg-statement">{fact.text}</p><div className="mg-source">{fact.source}</div></div>
            {duplicate && <div className="mg-feedback bad">Цей факт уже обрано в іншому блоці. Оберіть інший фрагмент.</div>}
            <h2 className="mg-question">Чи вказує цей факт на можливе умисне вбивство?</h2>
            <div className="mg-answer"><button className={pick.answer==="yes"?"selected":""} onClick={()=>updatePick(index,{answer:"yes"})}>ТАК</button><button className={pick.answer==="no"?"selected":""} onClick={()=>updatePick(index,{answer:"no"})}>НІ</button></div>
            {pick.answer && <div className={`mg-feedback ${isCorrect?"good":"bad"}`}>{isCorrect ? "Вірно. " : "Відповідь не зарахована. "}{fact.explanation}{isCorrect ? " Вам нараховано 1 бал." : ""}</div>}
          </section>
        })}
        <div className="mg-actions">
          {score >= 1 && <button className="mg-secondary" onClick={addPick}>＋ ДОДАТИ ЩЕ ФАКТИ</button>}
          {score >= 2 && <button className="mg-primary" onClick={submitFacts}>ПОДАТИ ФАКТИ НАЧАЛЬНИКУ →</button>}
        </div>
        <p className="mg-muted">Повторний вибір уже використаного фрагмента не допускається. Нейтральні факти також можна обирати, але бал нараховується лише за правильне визначення ознаки умисного вбивства.</p>
      </> : <section className="mg-panel">
        <div className="mg-kicker">ЗВІТ ДЛЯ КЕРІВНИКА СЛІДЧОЇ ГРУПИ</div>
        <h1 className="mg-title">Факти подано</h1>
        <p className="mg-lead">До розгляду передано {correctFacts.length} правильно визначених фактів.</p>
        {correctFacts.map((p, i) => {
          const fact = getFact(p)!
          return <div className="mg-report" key={fact.id}><strong>{i+1}. {fact.label}</strong><p>{fact.text}</p><div className="mg-source">{fact.source}</div></div>
        })}
        <div className="mg-success">Начальник отримав зібрані факти. Наступний етап — оцінка сукупності обставин і визначення подальших слідчих дій.</div>
        <div className="mg-actions"><button className="mg-primary" onClick={()=>setReviewed(true)} disabled={reviewed}>{reviewed ? "ЗВІТ ПЕРЕГЛЯНУТО" : "ПІДТВЕРДИТИ ОЗНАЙОМЛЕННЯ"}</button><button className="mg-secondary" onClick={onBack}>ПОВЕРНУТИСЯ ДО ТЕРМІНАЛА</button></div>
      </section>}
    </div>
  </main>
}
