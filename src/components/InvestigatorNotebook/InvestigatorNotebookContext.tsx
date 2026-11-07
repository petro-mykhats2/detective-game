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

export type InvestigationNote = {
  id: string
  title: string
  details?: string
  status: NotebookStatus
  source?: string
  createdAt: string
  updatedAt: string
}

export type AddInvestigationNoteInput = {
  title: string
  details?: string
  status?: NotebookStatus
  source?: string
}

type InvestigatorNotebookContextValue = {
  notes: InvestigationNote[]
  addNote: (input: AddInvestigationNoteInput) => string
  updateNote: (id: string, patch: Partial<Omit<InvestigationNote, "id" | "createdAt">>) => void
  removeNote: (id: string) => void
  clearNotes: () => void
}

const STORAGE_KEY = "detective-investigation-notebook-v1"

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
      return (
        typeof note.id === "string" &&
        typeof note.title === "string" &&
        typeof note.status === "string" &&
        typeof note.createdAt === "string" &&
        typeof note.updatedAt === "string"
      )
    })
  } catch {
    return []
  }
}

export function InvestigatorNotebookProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<InvestigationNote[]>(readNotes)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // Локальне сховище може бути недоступним у приватному режимі.
    }
  }, [notes])

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
          createdAt: now,
          updatedAt: now,
        }

        setNotes((current) => [note, ...current])
        return id
      },

      updateNote: (id, patch) => {
        setNotes((current) =>
          current.map((note) =>
            note.id === id
              ? { ...note, ...patch, updatedAt: new Date().toISOString() }
              : note,
          ),
        )
      },

      removeNote: (id) => {
        setNotes((current) => current.filter((note) => note.id !== id))
      },

      clearNotes: () => {
        setNotes([])
      },
    }),
    [notes],
  )

  return <NotebookContext.Provider value={value}>{children}</NotebookContext.Provider>
}

export function useInvestigatorNotebook() {
  const context = useContext(NotebookContext)

  if (!context) {
    throw new Error(
      "useInvestigatorNotebook must be used inside InvestigatorNotebookProvider",
    )
  }

  return context
}
