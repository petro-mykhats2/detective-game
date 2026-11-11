export const CASE_KEY_VEHICLES = [
  { plate: "АХ 4772 ВХ", ownerName: "Макаренко Олег Сергійович" },
  { plate: "РЕ 2399 ЕН", ownerName: "Малишев Дмитро Олегович" },
  { plate: "ВІ 0010 АА", ownerName: "Бурий Іван Дмитрович" },
] as const

export const CASE_KEY_PLATES = CASE_KEY_VEHICLES.map((vehicle) => vehicle.plate)

export function isCaseKeyPlate(plate?: string) {
  return Boolean(plate && CASE_KEY_PLATES.includes(plate.trim() as (typeof CASE_KEY_PLATES)[number]))
}
