import { useEffect, useState } from "react"
import { useInvestigatorNotebook } from "../InvestigatorNotebook/InvestigatorNotebookContext"
import { useVehicleSearch } from "../VehicleSearch/VehicleSearchContext"
import "./DetectiveMenu.css"

export default function DetectiveMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { openNotebook } = useInvestigatorNotebook()
  const { openVehicleSearch } = useVehicleSearch()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  function closeMenu() {
    setIsOpen(false)
  }

  function openNotebookFromMenu() {
    closeMenu()
    openNotebook()
  }

  function openVehicleSearchFromMenu() {
    closeMenu()
    openVehicleSearch()
  }

  return (
    <>
      <button
        type="button"
        className="detective-menu__trigger"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? "Закрити меню" : "Відкрити меню слідчого"}
        aria-expanded={isOpen}
        aria-controls="detective-menu-panel"
      >
        <span className="detective-menu__trigger-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="detective-menu__trigger-label">МЕНЮ</span>
      </button>

      {isOpen && (
        <div
          className="detective-menu__backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMenu()
          }}
        >
          <aside
            id="detective-menu-panel"
            className="detective-menu"
            aria-label="Навігація слідчого"
          >
            <header className="detective-menu__header">
              <div>
                <span className="detective-menu__eyebrow">СЛУЖБОВИЙ ДОСТУП · CASE 001</span>
                <h2>Робоче меню</h2>
              </div>
              <button
                type="button"
                className="detective-menu__close"
                onClick={closeMenu}
                aria-label="Закрити меню"
              >
                ×
              </button>
            </header>

            <div className="detective-menu__status">
              <span className="detective-menu__status-dot" aria-hidden="true" />
              <span>СИСТЕМА ГОТОВА</span>
              <span className="detective-menu__status-line" />
              <span>СПРАВА № 001</span>
            </div>

            <nav className="detective-menu__items" aria-label="Інструменти">
              <button
                type="button"
                className="detective-menu__item investigator-notebook-trigger"
                onClick={openNotebookFromMenu}
              >
                <span className="detective-menu__item-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32">
                    <path d="M9 4.5h13a2 2 0 0 1 2 2v19a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-19a2 2 0 0 1 2-2Z" />
                    <path d="M11.5 4.5v23M14.5 10h6M14.5 14h6M14.5 18h4.5" />
                    <path d="M5 9h2M5 13h2M5 17h2M5 21h2" />
                  </svg>
                </span>
                <span className="detective-menu__item-copy">
                  <strong>Блокнот слідчої групи</strong>
                  <small>Робочі записи, статуси та висновки</small>
                </span>
                <span className="detective-menu__item-arrow" aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                className="detective-menu__item"
                onClick={openVehicleSearchFromMenu}
              >
                <span className="detective-menu__item-icon detective-menu__item-icon--vehicle" aria-hidden="true">
                  <svg viewBox="0 0 32 32">
                    <path d="M6 19.5v-5l2.8-5.5h14.4l2.8 5.5v5" />
                    <path d="M8.5 19.5h15M9 14.5h14M11 23.5h-2v-4M21 23.5h2v-4" />
                    <circle cx="10.5" cy="19.5" r="1.7" />
                    <circle cx="21.5" cy="19.5" r="1.7" />
                  </svg>
                </span>
                <span className="detective-menu__item-copy">
                  <strong>Пошук транспортного засобу</strong>
                  <small>Перевірка номерного знака та даних НАІС МВС</small>
                </span>
                <span className="detective-menu__item-arrow" aria-hidden="true">→</span>
              </button>
            </nav>

            <footer className="detective-menu__footer">
              <span>ВНУТРІШНІЙ ІНСТРУМЕНТ</span>
              <span>ДОСТУП КАПІТАНА</span>
            </footer>
          </aside>
        </div>
      )}
    </>
  )
}
