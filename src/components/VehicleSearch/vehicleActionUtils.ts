export type VehicleAction = "interrogate" | "suspicion" | "wanted"

type ActionVehicle = {
  plate: string
  owner: string
  ownerType: string
}

export function ownerName(car: ActionVehicle) {
  const withoutParentheses = car.owner.replace(/\s*\([^)]*\)/g, "").trim()

  if (car.ownerType === "ФОП") {
    return withoutParentheses.replace(/^ФОП\s+/i, "").trim()
  }

  return withoutParentheses
}

export function getActionMessage(car: ActionVehicle, action: VehicleAction) {
  const name = ownerName(car)

  if (action === "interrogate") {
    return car.ownerType === "ЮР"
      ? `Буде викликано на допит представника: ${name}.`
      : `Буде викликано на допит власника: ${name}.`
  }

  if (action === "suspicion") {
    return car.ownerType === "ЮР"
      ? "Клопотання про підозру буде підготовлено щодо особи, яка керувала автомобілем."
      : `Клопотання про підозру буде підготовлено. Особа: ${name}.`
  }

  return "Немає підстав."
}

export function getNotebookEntryText(car: ActionVehicle, action: VehicleAction) {
  const name = ownerName(car)

  if (action === "interrogate") {
    return car.ownerType === "ЮР"
      ? `Заплановано допит представника: ${name} (${car.plate})`
      : `Заплановано допит власника: ${name} (${car.plate})`
  }

  if (action === "suspicion") {
    return car.ownerType === "ЮР"
      ? `Заплановано клопотання про підозру щодо особи, яка керувала автомобілем (${car.plate})`
      : `Заплановано клопотання про підозру: ${name} (${car.plate})`
  }

  return ""
}
