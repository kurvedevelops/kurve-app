import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export function ActionDropdown({ onEdit, onView, onDelete }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 176, // 176 = w-44
      });
    }
    setOpen((prev) => !prev);
  }

  const menu = (
    <div
      style={{ top: menuPos.top, left: menuPos.left }}
      className="fixed z-50 w-44 rounded-lg border border-gray-100 bg-white shadow-md py-1"
    >
      <button
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={() => {
          setOpen(false);
          onEdit?.();
        }}
      >
        Editar
      </button>
      <button
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={() => {
          setOpen(false);
          onView?.();
        }}
      >
        Ver detalle
      </button>
      <button
        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
        onClick={() => {
          setOpen(false);
          onDelete?.();
        }}
      >
        Eliminar cliente
      </button>
    </div>
  );

  return (
    <td className="px-4 py-3.5">
      <button
        ref={buttonRef}
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        onClick={handleOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
          />
        </svg>
      </button>

      {open && createPortal(menu, document.body)}
    </td>
  );
}
