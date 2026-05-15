"use client";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Home() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error("Error al iniciar sesión:", error.message);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user!.id)
      .single();

    const role = profile?.role;

    if (role === "admin") router.push("/admin");
    else if (role === "member") router.push("/member");
    else if (role === "client") router.push("/client");
    else router.push("/unauthorized");
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex md:w-[50%] lg:w-[65%] flex-col bg-cover bg-center bg-no-repeat relative bg-[url('/login-background.jpeg')]">
        <div className="flex flex-col justify-between py-12 md:pl-8 lg:pl-14 pl-14 h-full">
          <h1 className="text-azul-kurve text-4xl font-bold">kurve</h1>
          <div className="flex flex-col gap-6">
            <h2 className="text-5xl leading-14 font-bold text-azul-kurve">
              Conectando
              <br />
              tu equipo
              <br />
              <span className="text-verde-kurve">con tus clientes</span>
            </h2>

            <p className="max-w-sm text-zinc-600">
              Plataforma de gestión y control de actividades para agencias de
              marketing. Registra, supervisa y muestra resultados en tiempo
              real.
            </p>
          </div>
          <span className="text-sm text-gray-400">
            Código que crea experiencias
          </span>
        </div>
      </div>

      <div className="w-full md:flex-1 flex items-center justify-center px-8 md:px-20">
        <div className="w-full max-w-md flex flex-col gap-10">
          <div className="flex flex-col items-center md:items-start justify-center md:justify-start gap-10">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4">
              <span className="text-white text-md size-10 flex items-center justify-center font-bold bg-verde-kurve rounded-xl">
                k
              </span>
              <h2 className="text-azul-kurve text-3xl font-bold">kurve</h2>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="w-fit bg-verde-kurve-light text-azul-kurve text-xs font-bold px-4 py-1 rounded-full">
                BIENVENIDO
              </span>

              <h1 className="text-4xl font-bold text-azul-kurve">
                Iniciar sesión
              </h1>

              <p className="">Ingresá con tu cuenta para acceder a tu panel.</p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-azul-kurve"
                >
                  Email
                </label>
                <div className="h-14 bg-muted border border-border rounded-2xl px-5 flex items-center transition-all focus-within:border-verde-kurve focus-within:ring-2 focus-within:ring-verde-kurve/20">
                  <div className="text-verde-kurve">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    placeholder="tucorreo@ejemplo.com"
                    {...register("email")}
                    className="border-0 shadow-none bg-muted focus-visible:ring-0 focus-visible:ring-off set-0 p-0 pl-4 text-lg text-azul-kurve placeholder:text-[#9CA39C]"
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-azul-kurve"
                >
                  Contraseña
                </label>
                <div className="h-14 bg-muted border border-border rounded-2xl px-5 flex items-center transition-all focus-within:border-verde-kurve focus-within:ring-2 focus-within:ring-verde-kurve/20">
                  <div className="text-verde-kurve">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="border-0 shadow-none bg-muted focus-visible:ring-0 focus-visible:ring-off set-0 p-0 pl-4 text-lg text-azul-kurve placeholder:text-[#9CA39C]"
                  />
                </div>
                {errors.password && (
                  <span className="text-xs text-red-500">
                    {errors.password.message}
                  </span>
                )}
                <button
                  type="button"
                  className="text-sm text-azul-kurve font-semibold self-end mt-1"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-14 bg-verde-kurve hover:opacity-90 transition-all rounded-xl text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Ingresando..." : "Ingresar →"}
              </button>
            </form>

            <p className="text-center text-[12px] text-[#9A9A9A]">
              Sistema de uso interno y para clientes activos.
              <br />
              Si no tenés acceso, contactá a tu{" "}
              <span className="font-semibold text-azul-kurve">
                administrador
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
