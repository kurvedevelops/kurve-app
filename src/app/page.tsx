import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="space-y-2">
      <label
        htmlFor="email"
        className="text-sm font-medium text-foreground"
      >
        Correo electrónico
      </label>

      <Input
        id="email"
        type="email"
        placeholder="ejemplo@email.com"
        className="bg-background border-border"
      />

      <p className="text-sm ">
        Ingresá el correo asociado a tu cuenta.
      </p>
    </div>
  );
}
