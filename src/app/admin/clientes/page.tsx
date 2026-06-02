"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import { getInitials, useClients } from "@/hooks/middleware";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ActionDropdownProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

export function ActionDropdown({
  onEdit,
  onView,
  onDelete,
}: ActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
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

const ClientesPage = () => {
  const { clients, loadingClients } = useClients();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    console.log("eliminar", id);
  };

  const actions = [
    {
      label: "↓ Exportar",
      variant: "secondary" as const,
      onClick: () => console.log("Exportar"),
    },
    {
      label: "+ Nuevo cliente",
      variant: "primary" as const,
      onClick: () => console.log("Nuevo cliente"),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarAdmin />
      <main className="flex-1 md:ml-45 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          badge="Gestión de Clientes"
          title="Clientes"
          subtitle="Administra los clientes y sus paquetes contratados"
          actions={actions}
        />
        <div className="bg-white rounded-xl border mt-4 border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-gray-900">
                Todos los clientes
              </span>
              <span className="text-sm text-gray-400">
                {filtered.length}{" "}
                {filtered.length === 1 ? "registro" : "registros"}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 pr-3 h-9 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white w-52 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className=" border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Cliente", "Estado", "Paquete", "Alta", "Opciones"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3.5 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide border-b border-gray-200"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3.5 py-8 text-center text-sm text-gray-400"
                    >
                      Sin resultados para {query}
                    </td>
                  </tr>
                ) : (
                  filtered.map((client, i) => (
                    <tr
                      key={client.id}
                      className={
                        i < filtered.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }
                    >
                      {/* Client */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-xs font-medium text-green-800 shrink-0">
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <Link
                              href={`/admin/clientes/${client.id}`}
                              className="text-sm font-medium text-gray-900"
                            >
                              {client.name}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5">
                        {client.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Package */}
                      <td className="py-3.5">
                        {client.package ? (
                          <span className="text-sm text-gray-700">
                            {client.package}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1 bg-gray-50">
                            Sin paquete
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 text-sm text-gray-400">
                        {client.created_at.slice(0, 10)}
                      </td>

                      {/* Actions */}
                      <ActionDropdown
                        onEdit={() =>
                          router.push(`/admin/clientes/${client.id}/edit`)
                        }
                        onView={() =>
                          router.push(`/admin/clientes/${client.id}`)
                        }
                        onDelete={() => handleDelete(client.id)}
                      />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientesPage;
