import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema para piezas del paquete
const packagePieceSchema = z.object({
  category_id: z.string().uuid(),

  quantity: z.number().int().min(0),
});

// Schema para crear paquetes
const createPackageSchema = z
  .object({
    client_id: z.string().uuid().nullable().optional(),

    name: z.string().min(1).max(100),

    status: z.enum(["active", "paused", "ended"]).optional(),

    start_date: z.string().nullable().optional(),

    end_date: z.string().nullable().optional(),

    total_hours: z.number().min(0),

    total_pieces: z.number().int().min(0).nullable().optional(),

    price: z.number().min(0).optional(),

    package_pieces: z.array(packagePieceSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.client_id && !data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "La fecha de inicio es requerida cuando el paquete tiene un cliente asignado",
        path: ["start_date"],
      });
    }

    if (data.start_date && !data.client_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Debe seleccionar un cliente cuando se especifica una fecha de inicio",
        path: ["client_id"],
      });
    }
  });

// GET /api/packages
// Obtener paquetes
export async function GET() {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener paquetes con joins
  const { data: packages, error } = await supabase
    .from("packages")
    .select(
      `
      *,
      clients(*),
      package_pieces(
        *,
        piece_categories(*)
      )
    `,
    )
    .order("created_at", { ascending: false });

  // Manejar error
  if (error) {
    return NextResponse.json(
      {
        error: "Error al obtener paquetes",
      },
      { status: 500 },
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      data: packages,
    },
    { status: 200 },
  );
}

// POST /api/packages
// Crear paquete
export async function POST(request: Request) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener body
  const body = await request.json();

  // Validar body con Zod
  const parsed = createPackageSchema.safeParse(body);

  // Manejar error de validación
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  // Nota: un cliente puede tener múltiples paquetes activos a la vez
  // (regla de negocio nueva). Ya no se rechaza si existe otro activo.

  // Crear paquete principal
  const { data: createdPackage, error: packageError } = await supabase
    .from("packages")
    .insert({
      client_id: parsed.data.client_id,
      name: parsed.data.name,
      status: parsed.data.status ?? "active",
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date ?? null,
      total_hours: parsed.data.total_hours,
      total_pieces: parsed.data.total_pieces ?? null,
      price: parsed.data.price ?? 0,
    })
    .select()
    .single();

  // Manejar error del paquete
  if (packageError || !createdPackage) {
    return NextResponse.json(
      {
        error: "Error al crear paquete",
      },
      { status: 500 },
    );
  }

  // Insertar categorías/piezas del paquete si vienen en el body
  if (parsed.data.package_pieces && parsed.data.package_pieces.length > 0) {
    const packagePiecesPayload = parsed.data.package_pieces.map((piece) => ({
      package_id: createdPackage.id,
      category_id: piece.category_id,
      quantity: piece.quantity,
    }));

    const { error: piecesError } = await supabase
      .from("package_pieces")
      .insert(packagePiecesPayload);

    // Manejar error
    if (piecesError) {
      return NextResponse.json(
        {
          error: "Error al crear piezas del paquete",
        },
        { status: 500 },
      );
    }
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Paquete creado correctamente",
      data: createdPackage,
    },
    { status: 201 },
  );
}
