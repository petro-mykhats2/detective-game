export const assistantTexts = {
  caseKey: {
    interrogate: {
      "ВІ 0010 АА": [
        "Маєш рацію, капітане, щодо Бурого: марка його авто дійсно схожа на чорний джип, який є в даних з камер. Я дістану відео з камер, і потім порівняємо.",
      ],
      "РЕ 2399 ЕН": [
        "Маєш рацію, капітане, щодо Малишева: марка його авто дійсно схожа на чорний джип, який є в даних з камер. Я дістану відео з камер, і потім порівняємо.",
      ],
      "АХ 4772 ВХ": [
        "Капітане, дійсно, номери Ford Focus, які належать Макаренку, використовувались не на його авто. Або він їх повісив як номер прикриття, або нам треба з'ясувати, як ці номери опинились на чорній Toyota.",
      ],
    },
    suspicion: {
      "ВІ 0010 АА": [
        "Рано, капітане. Спершу порівняймо відео з камер із його авто, а вже потім говоритимемо про підозру.",
        "Капітане, підстав для підозри поки немає: схожа марка ще нічого не доводить. Дочекаймося відео.",
      ],
      "РЕ 2399 ЕН": [
        "Рано, капітане. Спершу порівняймо відео з камер із його авто, а вже потім говоритимемо про підозру.",
        "Капітане, підстав для підозри поки немає: схожа марка ще нічого не доводить. Дочекаймося відео.",
      ],
      "АХ 4772 ВХ": [
        "Рано, капітане. Його номери опинились не на його авто, але чому саме, ми ще не знаємо. Спершу з'ясуймо це.",
        "Підозра щодо Макаренка передчасна: спершу треба зрозуміти, як його номери потрапили на чорну Toyota.",
      ],
    },
  },
  rejected: {
    individual: {
      physical: {
        suspicion: [
          "Прокурор не побачив доказів причетності до події, яка сталась, і тому відхилив ваше клопотання про підозру щодо: {names}.",
        ],
        interrogate: [
          "Я особисто перевірив: {names}. Можу з упевненістю сказати, що в цих людей залізне алібі, до того ж вони фізично не могли бути на місці злочину.",
        ],
      },
      legal: {
        suspicion: [
          "Прокурор не побачив доказів причетності до події, яка сталась, і тому відхилив ваше клопотання про підозру щодо: {names}.",
        ],
        interrogate: [
          "Я особисто перевірив: {names}. Можу з упевненістю сказати, що в цих людей залізне алібі, до того ж вони фізично не могли бути на місці злочину.",
        ],
      },
    },
  },
  summary: {
    completed: [
      "Капітане, ми отримали достатньо результатів для наступного кроку. Тепер можемо перейти до 5 конверту.",
    ],
    incomplete: [
      "Капітане, цього поки недостатньо. Розслідування ще не завершене. Повернімося до бази даних і продовжимо перевірку.",
    ],
  },
} as const

export type AssistantAction = "interrogate" | "suspicion"
export type CaseKeyPlate = keyof typeof assistantTexts.caseKey.interrogate

export function getAssistantText(
  plate: string,
  action: AssistantAction,
  variant = 0,
) {
  const variants = assistantTexts.caseKey[action][plate as CaseKeyPlate]
  return variants?.[variant] ?? variants?.[0] ?? ""
}

export function getRejectedText(
  ownerType: string,
  action: AssistantAction,
  names: string,
  variant = 0,
) {
  const group = ownerType === "ЮР" ? assistantTexts.rejected.individual.legal : assistantTexts.rejected.individual.physical
  const variants = group[action]
  return (variants?.[variant] ?? variants?.[0] ?? "").replace("{names}", names)
}

export function getSummaryText(completed: boolean, variant = 0) {
  const variants = completed ? assistantTexts.summary.completed : assistantTexts.summary.incomplete
  return variants[variant] ?? variants[0] ?? ""
}
