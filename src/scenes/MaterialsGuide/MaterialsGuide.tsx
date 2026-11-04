import { useMemo, useState } from "react"

type EvidenceKind = "key" | "supporting" | "neutral"

type Fact = {
  id: string
  groupId: string
  label: string
  text: string
  source: string
  kind: EvidenceKind
  explanation: string
}

type Section = {
  id: string
  label: string
  facts: Fact[]
}

type DocumentItem = {
  id: string
  title: string
  sections: Section[]
}

const documents: DocumentItem[] = [
  {
    id: "forensic",
    title: "Акт судово-медичного дослідження № 102/26",
    sections: [
      {
        id: "external",
        label: "II. Зовнішнє дослідження",
        facts: [
          {
            id: "clothing",
            groupId: "neutral-clothing",
            label: "Стан одягу",
            text: "На одязі виявлено множинні розриви та плями бурого кольору, схожі на кров.",
            source: "Акт № 102/26 · Розділ II · Зовнішнє дослідження",
            kind: "neutral",
            explanation: "Це опис стану одягу. Сам по собі він не встановлює умисного позбавлення життя.",
          },
          {
            id: "head-wound",
            groupId: "head-wound-description",
            label: "Забійна рана тім’яної ділянки",
            text: "Забійна рана розміром 4 × 1,5 см на тім’яній ділянці.",
            source: "Акт № 102/26 · Розділ II · Тілесні ушкодження",
            kind: "neutral",
            explanation: "Це важлива частина опису травми, але без висновку про час і механізм її утворення вона ще не дає повної відповіді щодо версії вбивства.",
          },
          {
            id: "no-belt-marks",
            groupId: "belt-staging",
            label: "Відсутність гематом від ременя",
            text: "Гематоми від натягу паска безпеки — відсутні.",
            source: "Акт № 102/26 · Розділ II · Тілесні ушкодження",
            kind: "supporting",
            explanation: "У сукупності з автотехнічним висновком про застібання ременя на вже мертве тіло це підтримує версію інсценування ДТП. Саме тому цей факт є підтверджуючим, а не окремим другим доказом.",
          },
        ],
      },
      {
        id: "internal",
        label: "III. Внутрішнє дослідження",
        facts: [
          {
            id: "skull",
            groupId: "fatal-head-trauma",
            label: "Перелом черепа та крововилив",
            text: "Вдавлений перелом тім’яної кістки під раною. Масивний субарахноїдальний крововилив.",
            source: "Акт № 102/26 · Розділ III · Череп та головний мозок",
            kind: "neutral",
            explanation: "Це опис тяжкої травми. Її значення для версії розслідування визначається разом із висновком про прижиттєвий характер і механізм травми.",
          },
          {
            id: "ribs",
            groupId: "postmortem-ribs",
            label: "Переломи ребер",
            text: "Множинні двосторонні переломи ребер 3–8; крововиливи у м’які тканини відсутні.",
            source: "Акт № 102/26 · Розділ III · Грудна клітка",
            kind: "neutral",
            explanation: "У висновку ці переломи пов’язані з ДТП та визначені як посмертні ушкодження.",
          },
        ],
      },
      {
        id: "conclusions",
        label: "V. Судово-медичний діагноз та висновки",
        facts: [
          {
            id: "premortem",
            groupId: "fatal-head-trauma",
            label: "Прижиттєва смертельна травма голови",
            text: "Смертельна черепно-мозкова травма виникла за життя. Ушкодження, пов’язані з падінням автомобіля, мають посмертний характер.",
            source: "Акт № 102/26 · Розділ V · Медична оцінка та головний висновок",
            kind: "key",
            explanation: "Це ключова ознака: смертельна травма виникла до падіння автомобіля, тому саме падіння не пояснює причину смерті.",
          },
          {
            id: "weapon",
            groupId: "deliberate-blow",
            label: "Механізм утворення смертельної травми",
            text: "Смертельна травма тім’яної ділянки — від сильного цілеспрямованого удару тупим твердим предметом.",
            source: "Акт № 102/26 · Розділ V · Механізм утворення травм",
            kind: "key",
            explanation: "Експерт пов’язує смертельну травму з сильним цілеспрямованим ударом тупим твердим предметом. Це прямо підтримує версію насильницького нападу.",
          },
          {
            id: "toxicology",
            groupId: "neutral-toxicology",
            label: "Результат токсикологічного дослідження",
            text: "Етиловий спирт, наркотичні та психотропні речовини не виявлено.",
            source: "Акт № 102/26 · Розділ IV · Хіміко-токсикологічне дослідження",
            kind: "neutral",
            explanation: "Результат важливий для справи, але сам по собі не вказує на умисне вбивство.",
          },
        ],
      },
    ],
  },
  {
    id: "vehicle",
    title: "Висновок експерта № 142/26-АВТО (V3)",
    sections: [
      {
        id: "body",
        label: "II. Технічний стан кузова та трасологічний аналіз",
        facts: [
          {
            id: "forced-push",
            groupId: "external-impact",
            label: "Примусове виштовхування автомобіля",
            text: "Слідова картина свідчить про примусове виштовхування транспортного засобу у прірву іншим масивним транспортним засобом.",
            source: "Висновок № 142/26-АВТО · Розділ II · Експертний висновок",
            kind: "key",
            explanation: "Експерт вказує на зовнішній силовий вплив іншого транспортного засобу, а не на звичайне самостійне падіння.",
          },
          {
            id: "paint",
            groupId: "external-impact",
            label: "Сторонні нашарування лакофарбового покриття",
            text: "У зоні контактного пошкодження виявлено темні чужорідні мікронашарування ЛФП, які відрізняються від штатного білого покриття автомобіля.",
            source: "Висновок № 142/26-АВТО · Розділ II · Технічний стан кузова",
            kind: "supporting",
            explanation: "Стороннє ЛФП у зоні силового контакту підтримує версію контакту з іншим транспортним засобом. Воно належить до тієї самої доказової групи, що й висновок про примусове виштовхування.",
          },
          {
            id: "rear-damage",
            groupId: "rear-damage-description",
            label: "Деформація задньої частини кузова",
            text: "Виявлено деформацію в області заднього бампера та кришки багажного відділення.",
            source: "Висновок № 142/26-АВТО · Розділ II · Технічний стан кузова",
            kind: "neutral",
            explanation: "Окремий опис деформації не встановлює механізм умисного виштовхування. Для цього важливий повний трасологічний висновок.",
          },
        ],
      },
      {
        id: "controls",
        label: "II. Аналіз органів управління та систем безпеки",
        facts: [
          {
            id: "neutral",
            groupId: "neutral-gear",
            label: "Нейтральне положення КПП до падіння",
            text: "Фіксатори важеля не мають слідів вибивання передачі під час падіння; це вказує на переведення КПП у нейтральне положення до моменту падіння ТЗ у прірву.",
            source: "Висновок № 142/26-АВТО · Розділ II · Положення важеля КПП",
            kind: "supporting",
            explanation: "Це підозріла обставина: автомобіль перебував у нейтралі до падіння. Однак сама по собі вона не доводить умисне вбивство, тому є підтверджуючою, а не ключовою ознакою.",
          },
          {
            id: "belt",
            groupId: "belt-staging",
            label: "Ремінь безпеки застебнутий на вже мертве тіло",
            text: "Сукупність ознак свідчить про те, що пасок безпеки був застебнутий у замок на вже мертве тіло.",
            source: "Висновок № 142/26-АВТО · Розділ II · Важлива обставина",
            kind: "key",
            explanation: "Це ключова обставина інсценування: експерт дійшов висновку, що ремінь застебнули вже після смерті водія.",
          },
        ],
      },
      {
        id: "traces",
        label: "III. Фіксація та вилучення супутніх речових доказів",
        facts: [
          {
            id: "fingerprints",
            groupId: "neutral-fingerprints",
            label: "Виявлені сліди папілярних узорів",
            text: "Виявлено сліди рук на ручках пасажирських дверей, панелі приладів, кермі, важелі КПП та ручці водійських дверей. Ідентифікація на цьому етапі не проводилась.",
            source: "Висновок № 142/26-АВТО · Розділ III · Дактилоскопічні сліди",
            kind: "neutral",
            explanation: "Наявність слідів рук без встановлення їх належності не доводить причетність конкретної особи чи умисне вбивство.",
          },
          {
            id: "hair",
            groupId: "neutral-hair",
            label: "Вилучене волосся",
            text: "Вилучено коротке темне волосся з підголівника водія та довге світле фарбоване волосся з переднього пасажирського сидіння; об’єкти направлено на ДНК-дослідження.",
            source: "Висновок № 142/26-АВТО · Розділ III · Біологічні об’єкти",
            kind: "neutral",
            explanation: "Це біологічні об’єкти для подальшого дослідження. Результатів ДНК у цьому документі ще немає.",
          },
          {
            id: "phone",
            groupId: "neutral-effects",
            label: "Особисті речі потерпілого",
            text: "Зафіксовано та опечатано смартфон, окуляри, гаманець і ключі потерпілого.",
            source: "Висновок № 142/26-АВТО · Розділ III · Особисті речі",
            kind: "neutral",
            explanation: "Перелік вилучених речей сам по собі не вказує на умисне вбивство.",
          },
        ],
      },
    ],
  },
]

type Pick = {
  documentId: string
  sectionId: string
  factId: string
  answer: "yes" | "no" | ""
}

function firstUnusedFact(excludedGroupIds: Set<string>) {
  for (const document of documents) {
    for (const section of document.sections) {
      for (const fact of section.facts) {
        if (!excludedGroupIds.has(fact.groupId)) {
          return {
            documentId: document.id,
            sectionId: section.id,
            factId: fact.id,
            answer: "" as const,
          }
        }
      }
    }
  }
  return {
    documentId: documents[0].id,
    sectionId: documents[0].sections[0].id,
    factId: documents[0].sections[0].facts[0].id,
    answer: "" as const,
  }
}

function getFact(pick: Pick) {
  const document = documents.find(item => item.id === pick.documentId)
  const section = document?.sections.find(item => item.id === pick.sectionId)
  return section?.facts.find(item => item.id === pick.factId)
}

export default function MaterialsGuide({
  onBack,
  onContinue,
}: {
  onBack: () => void
  onContinue: () => void
}) {
  const [picks, setPicks] = useState<Pick[]>([firstUnusedFact(new Set())])
  const [submitted, setSubmitted] = useState(false)

  const correctFacts = useMemo(
    () =>
      picks.filter(pick => {
        const fact = getFact(pick)
        return Boolean(
          fact &&
            pick.answer === "yes" &&
            fact.kind === "key" &&
            !picks.some(
              other =>
                other !== pick &&
                other.answer === "yes" &&
                getFact(other)?.groupId === fact.groupId,
            ),
        )
      }),
    [picks],
  )

  const score = correctFacts.length
  const usedGroupIds = new Set(
    picks.map(pick => getFact(pick)?.groupId).filter(Boolean) as string[],
  )

  function updatePick(index: number, patch: Partial<Pick>) {
    setPicks(current =>
      current.map((pick, itemIndex) =>
        itemIndex === index
          ? {
              ...pick,
              ...patch,
              answer:
                patch.documentId || patch.sectionId || patch.factId
                  ? ""
                  : patch.answer ?? pick.answer,
            }
          : pick,
      ),
    )
  }

  function changeDocument(index: number, documentId: string) {
    const document = documents.find(item => item.id === documentId) ?? documents[0]
    const section = document.sections[0]
    const firstAvailable =
      section.facts.find(fact => {
        const selected = getFact(picks[index])
        return fact.groupId === selected?.groupId || !usedGroupIds.has(fact.groupId)
      }) ?? section.facts[0]

    updatePick(index, {
      documentId: document.id,
      sectionId: section.id,
      factId: firstAvailable.id,
      answer: "",
    })
  }

  function changeSection(index: number, sectionId: string) {
    const pick = picks[index]
    const document = documents.find(item => item.id === pick.documentId) ?? documents[0]
    const section = document.sections.find(item => item.id === sectionId) ?? document.sections[0]
    const currentFact = getFact(pick)
    const fact =
      section.facts.find(item => item.groupId === currentFact?.groupId) ??
      section.facts.find(item => !usedGroupIds.has(item.groupId)) ??
      section.facts[0]

    updatePick(index, {
      sectionId: section.id,
      factId: fact.id,
      answer: "",
    })
  }

  function addPick() {
    const next = firstUnusedFact(usedGroupIds)
    if (usedGroupIds.size >= new Set(documents.flatMap(document => document.sections.flatMap(section => section.facts.map(fact => fact.groupId)))).size) {
      return
    }
    setPicks(current => [...current, next])
  }

  function submitFacts() {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="materials-guide">
        <style>{styles}</style>
        <div className="mg-wrap">
          <div className="mg-top">
            <span><i /> СПРАВА № 12026170010000456 · ПОПЕРЕДНІЙ ЗВІТ</span>
            <button className="mg-back" onClick={onBack}>← НАЗАД</button>
          </div>
          <section className="mg-panel">
            <div className="mg-kicker">ДОПОВІДЬ НАЧАЛЬНИКУ</div>
            <h1 className="mg-title">Факти подано</h1>
            <p className="mg-lead">
              Ви відібрали {score} ключові ознаки, які можна обґрунтовано доповісти начальнику.
              Підтверджуючі обставини залишаються частиною сукупності матеріалів, але не дають
              окремого бала за той самий доказовий комплекс.
            </p>
            {correctFacts.map((pick, index) => {
              const fact = getFact(pick)
              if (!fact) return null
              return (
                <div className="mg-report" key={fact.groupId}>
                  <strong>{index + 1}. {fact.label}</strong>
                  <p>{fact.text}</p>
                  <div className="mg-source">{fact.source}</div>
                </div>
              )
            })}
            <div className="mg-success">
              Начальнику передано не припущення про винну особу, а конкретні обставини,
              які потребують подальшої перевірки.
            </div>
            <div className="mg-actions">
              <button className="mg-primary" onClick={onContinue}>ПЕРЕЙТИ ДО НАСТУПНОГО ЕТАПУ →</button>
              <button className="mg-secondary" onClick={() => setSubmitted(false)}>ПЕРЕВІРИТИ ВИБІР</button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="materials-guide">
      <style>{styles}</style>
      <div className="mg-wrap">
        <div className="mg-top">
          <span><i /> ЦИФРОВИЙ СУПРОВІД · СПРАВА № 12026170010000456</span>
          <button className="mg-back" onClick={onBack}>← НАЗАД ДО БРИФІНГУ</button>
        </div>

        <div className="mg-kicker">АНАЛІТИЧНЕ ЗАВДАННЯ · ЕТАП 03</div>
        <h1 className="mg-title">Знайдіть ознаки умисного вбивства</h1>
        <p className="mg-lead">
          У паперових матеріалах є ключові ознаки, підтверджуючі обставини та нейтральні відомості.
          Оберіть конкретний фрагмент, уважно прочитайте його і визначте, чи дає він підстави
          перевірити версію умисного вбивства.
        </p>

        <div className="mg-score">Правильно знайдено: {score} · 1 бал за ключову ознаку</div>

        {picks.map((pick, index) => {
          const document = documents.find(item => item.id === pick.documentId) ?? documents[0]
          const section = document.sections.find(item => item.id === pick.sectionId) ?? document.sections[0]
          const fact = section.facts.find(item => item.id === pick.factId) ?? section.facts[0]
          const duplicate = picks.some(
            (other, otherIndex) =>
              otherIndex !== index && getFact(other)?.groupId === fact.groupId,
          )
          const isCorrect = pick.answer === "yes" && fact.kind === "key" && !duplicate

          return (
            <section className="mg-panel" key={index}>
              <div className="mg-kicker">ФАКТ ДЛЯ ПЕРЕВІРКИ · {String(index + 1).padStart(2, "0")}</div>
              <div className="mg-grid">
                <div className="mg-field">
                  <label>01 / ДОКУМЕНТ</label>
                  <select value={pick.documentId} onChange={event => changeDocument(index, event.target.value)}>
                    {documents.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}
                  </select>
                </div>
                <div className="mg-field">
                  <label>02 / РОЗДІЛ</label>
                  <select value={pick.sectionId} onChange={event => changeSection(index, event.target.value)}>
                    {document.sections.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}
                  </select>
                </div>
                <div className="mg-field">
                  <label>03 / ФРАГМЕНТ</label>
                  <select value={pick.factId} onChange={event => updatePick(index, { factId: event.target.value })}>
                    {section.facts.map(item => (
                      <option
                        value={item.id}
                        key={item.id}
                        disabled={
                          usedGroupIds.has(item.groupId) &&
                          item.groupId !== fact.groupId
                        }
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mg-report">
                <div className="mg-kicker">ОБРАНИЙ ФРАГМЕНТ</div>
                <p className="mg-statement">{fact.text}</p>
                <div className="mg-source">{fact.source}</div>
              </div>

              {duplicate && (
                <div className="mg-feedback bad">
                  Ця обставина вже використана в іншому блоці. Оберіть інший доказовий комплекс.
                </div>
              )}

              <h2 className="mg-question">Чи вказує цей факт на можливе умисне вбивство?</h2>
              <div className="mg-answer">
                <button className={pick.answer === "yes" ? "selected" : ""} onClick={() => updatePick(index, { answer: "yes" })}>ТАК</button>
                <button className={pick.answer === "no" ? "selected" : ""} onClick={() => updatePick(index, { answer: "no" })}>НІ</button>
              </div>

              {pick.answer && (
                <div className={`mg-feedback ${isCorrect ? "good" : "bad"}`}>
                  {isCorrect ? "Вірно. " : "Відповідь не зарахована. "}
                  {fact.explanation}
                  {isCorrect && " Вам нараховано 1 бал."}
                </div>
              )}
            </section>
          )
        })}

        <div className="mg-actions">
          {score >= 1 && <button className="mg-secondary" onClick={addPick}>＋ ДОДАТИ ЩЕ ФАКТИ</button>}
          {score >= 2 && <button className="mg-primary" onClick={submitFacts}>ПОДАТИ ФАКТИ НАЧАЛЬНИКУ →</button>}
        </div>

        <p className="mg-muted">
          Повторно використати той самий доказовий комплекс не можна. Підтверджуючі та нейтральні
          відомості допомагають відрізняти сильну ознаку від просто підозрілої деталі.
        </p>
      </div>
    </main>
  )
}

const styles = `
  .materials-guide{min-height:100vh;background:#0d1114;color:#e9e5dc;padding:clamp(18px,4vw,48px);font-family:inherit}
  .mg-wrap{max-width:1120px;margin:0 auto}.mg-top{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:1px solid #343a3b;padding-bottom:18px;margin-bottom:34px;color:#a7aaa4;font-size:11px;letter-spacing:.13em}
  .mg-top i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#c6a46a;margin-right:9px}.mg-back,.mg-secondary{background:transparent;border:1px solid #555b59;color:#ddd8cc;padding:11px 15px;cursor:pointer;font:inherit;font-size:11px;letter-spacing:.06em}
  .mg-kicker{color:#c6a46a;font-size:10px;letter-spacing:.2em;margin-bottom:12px}.mg-title{font:400 clamp(34px,5vw,56px)/1.08 Georgia,serif;margin:0 0 12px}.mg-lead{color:#aeb2ac;max-width:800px;line-height:1.7;margin-bottom:28px}
  .mg-panel{background:#171d20;border:1px solid #343c3e;padding:clamp(16px,3vw,26px);margin:16px 0}.mg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}
  .mg-field label{display:block;color:#a9aaa2;font-size:10px;letter-spacing:.12em;margin-bottom:9px}.mg-field select{width:100%;background:#0f1518;color:#eee9df;border:1px solid #485052;padding:13px 34px 13px 11px;font:inherit;font-size:13px;min-height:48px}
  .mg-score{font:24px Georgia,serif;color:#e4d0a9;margin:18px 0}.mg-question{font:24px Georgia,serif;margin:0 0 14px}.mg-statement{border-left:2px solid #c6a46a;padding:3px 0 3px 16px;color:#d9d7cf;line-height:1.75}.mg-source{color:#9ca49f;font-size:11px;margin-top:13px}
  .mg-answer{display:flex;gap:10px;margin-top:20px}.mg-answer button,.mg-primary{border:1px solid #8c754e;background:#c6a46a;color:#111;padding:12px 22px;cursor:pointer;font:inherit;font-size:12px;letter-spacing:.08em}.mg-answer button.selected{background:#e6d0a7;box-shadow:0 0 0 2px #c6a46a}.mg-feedback{margin-top:15px;padding:13px 15px;background:#101619;border:1px solid #3c4848;color:#c9cec7;line-height:1.6;font-size:13px}.mg-feedback.good{border-color:#55735f}.mg-feedback.bad{border-color:#80634d}
  .mg-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.mg-muted{font-size:12px;color:#9da49f;line-height:1.6}.mg-success{border:1px solid #55735f;background:#17231c;padding:17px;margin-top:18px;line-height:1.6}.mg-report{border:1px solid #424a49;padding:15px;margin:12px 0;line-height:1.6}.mg-report strong{color:#e3d0a9}
  @media(max-width:760px){.mg-grid{grid-template-columns:1fr}.mg-top{align-items:flex-start;flex-direction:column}.mg-answer button{flex:1}}
`
