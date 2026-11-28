import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type NotebookStatus =
  | "in-progress"
  | "rejected"
  | "completed"
  | "awaiting-conclusion"
  | "decision-made"
  | "cannot-complete"
  | "awaiting-conditions"
  | "pending"
  | "approved"

export type InvestigationNote = {
  id: string
  title: string
  details?: string
  status: NotebookStatus
  source?: string
  plate?: string
  ownerName?: string
  action?: "interrogate" | "suspicion" | "wanted"
  createdAt: string
  updatedAt: string
}

export type WitnessContradictionStatus = "pending" | "розв'язано"

export type WitnessContradiction = {
  id: string
  witness: string
  quoteId: string
  quote: string
  documentId: string
  document: string
  failedAttempts: number
  hintsUsed: number
  maxHintLevel: number
  status: WitnessContradictionStatus
  createdAt: string
  updatedAt: string
}

export type AddWitnessContradictionInput = Omit<WitnessContradiction, "id" | "createdAt" | "updatedAt">

export type AddInvestigationNoteInput = {
  title: string
  details?: string
  status?: NotebookStatus
  source?: string
  plate?: string
  ownerName?: string
  action?: "interrogate" | "suspicion" | "wanted"
}

type InvestigatorNotebookContextValue = {
  notes: InvestigationNote[]
  addNote: (input: AddInvestigationNoteInput) => string
  updateNote: (id: string, patch: Partial<Omit<InvestigationNote, "id" | "createdAt">>) => void
  removeNote: (id: string) => void
  clearNotes: () => void
  contradictions: WitnessContradiction[]
  upsertContradiction: (input: AddWitnessContradictionInput) => string
  updateContradiction: (id: string, patch: Partial<Omit<WitnessContradiction, "id" | "createdAt">>) => void
  removeContradiction: (id: string) => void
  clearContradictions: () => void
  isOpen: boolean
  openNotebook: () => void
  closeNotebook: () => void
}

const STORAGE_KEY = "detective-investigation-notebook-v1"
const CONTRADICTIONS_STORAGE_KEY = "detective-witness-contradictions-v1"

const NotebookContext = createContext<InvestigatorNotebookContextValue | null>(null)

function readNotes(): InvestigationNote[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is InvestigationNote => {
      if (!item || typeof item !== "object") return false
      const note = item as Record<string, unknown>
      return typeof note.id === "string" &&
        typeof note.title === "string" &&
        typeof note.status === "string" &&
        typeof note.createdAt === "string" &&
        typeof note.updatedAt === "string"
    })
  } catch {
    return []
  }
}

function readContradictions(): WitnessContradiction[] {
  try {
    const stored = localStorage.getItem(CONTRADICTIONS_STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is WitnessContradiction => {
      if (!item || typeof item !== "object") return false
      const record = item as Record<string, unknown>
      return typeof record.id === "string" &&
        typeof record.witness === "string" &&
        typeof record.quoteId === "string" &&
        typeof record.documentId === "string" &&
        typeof record.status === "string" &&
        typeof record.createdAt === "string" &&
        typeof record.updatedAt === "string"
    })
  } catch {
    return []
  }
}

export function InvestigatorNotebookProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<InvestigationNote[]>(readNotes)
  const [contradictions, setContradictions] = useState<WitnessContradiction[]>(readContradictions)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // Локальне сховище може бути недоступним у приватному режимі.
    }
  }, [notes])

  useEffect(() => {
    try {
      localStorage.setItem(CONTRADICTIONS_STORAGE_KEY, JSON.stringify(contradictions))
    } catch {
      // Окреме сховище дає змогу відновити доручення після перезавантаження.
    }
  }, [contradictions])

  const value = useMemo<InvestigatorNotebookContextValue>(
    () => ({
      notes,
      addNote: (input) => {
        const now = new Date().toISOString()
        const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const note: InvestigationNote = {
          id,
          title: input.title.trim(),
          details: input.details?.trim() || undefined,
          status: input.status ?? "pending",
          source: input.source?.trim() || undefined,
          plate: input.plate?.trim() || undefined,
          ownerName: input.ownerName?.trim() || undefined,
          action: input.action,
          createdAt: now,
          updatedAt: now,
        }
        setNotes((current) => [note, ...current])
        return id
      },
      updateNote: (id, patch) => setNotes((current) =>
        current.map((note) => note.id === id
          ? { ...note, ...patch, updatedAt: new Date().toISOString() }
          : note),
      ),
      removeNote: (id) => setNotes((current) => current.filter((note) => note.id !== id)),
      clearNotes: () => setNotes([]),

      contradictions,
      upsertContradiction: (input) => {
        const existing = contradictions.find((item) =>
          item.witness === input.witness &&
          item.quoteId === input.quoteId &&
          item.documentId === input.documentId,
        )
        const now = new Date().toISOString()
        if (existing) {
          setContradictions((current) => current.map((item) =>
            item.id === existing.id
              ? { ...item, ...input, updatedAt: now }
              : item,
          ))
          return existing.id
        }
        const id = `contradiction-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const record: WitnessContradiction = { ...input, id, createdAt: now, updatedAt: now }
        setContradictions((current) => [record, ...current])
        return id
      },
      updateContradiction: (id, patch) => setContradictions((current) =>
        current.map((item) => item.id === id
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item),
      ),
      removeContradiction: (id) => setContradictions((current) => current.filter((item) => item.id !== id)),
      clearContradictions: () => setContradictions([]),

      isOpen,
      openNotebook: () => setIsOpen(true),
      closeNotebook: () => setIsOpen(false),
    }),
    [notes, contradictions, isOpen],
  )

  return <NotebookContext.Provider value={value}>{children}</NotebookContext.Provider>
}

export function useInvestigatorNotebook() {
  const context = useContext(NotebookContext)
  if (!context) {
    throw new Error("useInvestigatorNotebook must be used inside InvestigatorNotebookProvider")
  }
  return context
}
