import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type VehicleSearchContextValue = {
  isOpen: boolean
  openVehicleSearch: () => void
  closeVehicleSearch: () => void
}

const VehicleSearchContext = createContext<VehicleSearchContextValue | null>(null)

export function VehicleSearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo(
    () => ({
      isOpen,
      openVehicleSearch: () => setIsOpen(true),
      closeVehicleSearch: () => setIsOpen(false),
    }),
    [isOpen],
  )

  return <VehicleSearchContext.Provider value={value}>{children}</VehicleSearchContext.Provider>
}

export function useVehicleSearch() {
  const context = useContext(VehicleSearchContext)
  if (!context) {
    throw new Error("useVehicleSearch must be used inside VehicleSearchProvider")
  }
  return context
}
