"use client";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { useEffect } from "react";

export default function RedirectedAlert() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("redirected") === "true") {
      Swal.fire({
        title: "Acceso denegado",
        text: "No tienes permisos para ingresar a la página solicitada",
        icon: "error",
        confirmButtonColor: "#76B041",
      });
    }
  }, [searchParams]);
}
