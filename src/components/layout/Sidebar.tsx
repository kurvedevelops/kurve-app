"use client";
import Image from "next/image";
import Link from "next/link";

const Sidebar = () => {
  return (
    <>
      <aside
        className="
          w-64 min-h-[80vh] bg-background text-azul-kurve flex flex-col py-8 px-4
          transition-all duration-300"
      >
        <Image
          src="/kurve-icon.png"
          alt="Logo"
          width={100}
          height={100}
          priority
          className="mb-6 ml-3"
        />
        <nav className="sticky flex flex-col gap-4 ml-3">
          <div>
            <p className="uppercase text-[13px] mb-2 mt-4 font-bold text-gris-kurve-dark">
              Principal
            </p>
            <div className="flex flex-col">
              <Link
                href="/admin"
                className="py-2 pl-2 rounded-lg hover:bg-muted transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div>
            <p className="uppercase font-bold text-[13px] mb-2 text-gris-kurve-dark">
              Gestion
            </p>
            <div className="flex flex-col">
              <Link
                href="/admin/clientes"
                className="py-2 pl-2 rounded-lg hover:bg-muted transition-colors"
              >
                Clientes
              </Link>
              <Link
                href="/admin/integrantes"
                className="py-2 pl-2 rounded-lg hover:bg-muted transition-colors"
              >
                Integrantes
              </Link>
              <Link
                href="/admin/paquetes"
                className="py-2 pl-2 rounded-lg hover:bg-muted transition-colors"
              >
                Paquetes
              </Link>
            </div>
          </div>
          <div>
            <p className="uppercase font-bold text-[13px] mb-2 text-gris-kurve-dark">
              Operacion
            </p>
            <div className="flex flex-col">
              <Link
                href="/admin"
                className="py-2 pl-2 rounded-lg hover:bg-muted transition-colors"
              >
                Planilla de tiempos
              </Link>
              <Link
                href="/admin"
                className="py-2 pl-2 rounded-lg hover:bg-muted transition-colors"
              >
                Correcciones
              </Link>
            </div>
          </div>
          <div>
            <p className="uppercase font-bold text-[13px] mb-2 text-gris-kurve-dark">
              Configuracion
            </p>
            <div className="flex flex-col">
              <Link
                href="/admin"
                className="py-2 pl-2 rounded-lg hover:bg-muted transition-colors"
              >
                Ajustes
              </Link>
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gris-kurve-light hover:bg-muted transition-colors cursor-pointer">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-verde-kurve flex items-center justify-center text-white font-bold text-sm">
              LM
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                Lucas Méndez
              </p>
              <p className="text-xs text-gris-kurve-dark truncate">
                Administrador
              </p>
            </div>

            {/* Menu Icon */}
            <button className="text-gris-kurve-dark hover:text-foreground transition-colors cursor-pointer">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="hover:scale-130 hover:rotate-5 transition-transform"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 4.75C5 3.78 5.78 3 6.75 3H13.25C14.22 3 15 3.78 15 4.75V19.25C15 20.22 14.22 21 13.25 21H6.75C5.78 21 5 20.22 5 19.25V4.75Z"
                  stroke="#1F3B45"
                  stroke-width="2"
                  stroke-linejoin="round"
                />

                <path
                  d="M11 12H21"
                  stroke="#76B041"
                  stroke-width="2"
                  stroke-linecap="round"
                />

                <path
                  d="M17 8L21 12L17 16"
                  stroke="#76B041"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <path
                  d="M8 8H11"
                  stroke="#1F3B45"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
