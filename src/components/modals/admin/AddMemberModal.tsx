import Modal from "@/components/modals/Modal";

const AddMemberModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full">
        <div className="pb-4">
          <h2 className="text-xl font-semibold text-azul-kurve">
            Información del Nuevo Miembro
          </h2>
          <p className="text-sm text-gris-kurve-dark mt-1">
            Completa los datos para invitar a un nuevo colaborador al equipo.
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-azul-kurve mb-2"
            >
              Nombre del Integrante
            </label>

            <input
              type="text"
              id="name"
              placeholder="Ej. Ana García"
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-azul-kurve mb-2"
            >
              Email
            </label>

            <input
              type="email"
              id="email"
              placeholder="ana.garcia@empresa.com"
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-azul-kurve mb-2"
            >
              Rol
            </label>

            <select
              id="role"
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value="">Selecciona un rol</option>
              <option value="developer">Desarrollador</option>
              <option value="designer">Diseñador</option>
              <option value="manager">Gerente</option>
            </select>
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendInvitation"
              className="h-4 w-4 rounded border-slate-300"
            />

            <label
              htmlFor="sendInvitation"
              className="text-sm text-gris-kurve-dark"
            >
              Enviar invitación por correo automáticamente
            </label>
          </div>

          <div className="border-t border-gris-kurve-light pt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-5 py-2 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="cursor-pointer px-5 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddMemberModal;
