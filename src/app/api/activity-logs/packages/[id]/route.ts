import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema para piezas del paquete
const packagePieceSchema = z.object({
  category_id: z.string().uuid(),

  quantity: z.number().int().min(0),
});

// Schema para editar paquetes
const updatePackageSchema = z.object({
  client_id: z.string().uuid().optional(),

  name: z.string().min(2).max(100).optional(),

  status: z.enum(["active", "paused", "ended"]).optional(),

  start_date: z.string().optional(),

  end_date: z.string().nullable().optional(),

  total_hours: z.number().min(0).optional(),

  total_pieces: z.number().int().min(0).nullable().optional(),

  package_pieces: z.array(packagePieceSchema).optional(),
});

// GET /api/packages/:id
// Obtener paquete por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener ID desde params
  const { id } = await params;

  // Buscar paquete con relaciones
  const { data: packageData, error } = await supabase
    .from("packages")
    .select(
      `
      *,
      clients(*),
      package_pieces(
        *,
        piece_categories(*)
      )
    `
    )
    .eq("id", id)
    .single();

  // Manejar error
  if (error || !packageData) {
    return NextResponse.json(
      {
        error: "Paquete no encontrado",
      },
      { status: 404 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      data: packageData,
    },
    { status: 200 }
  );
}

// PATCH /api/packages/:id
// Editar paquete
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener ID desde params
  const { id } = await params;

  // Obtener body
  const body = await request.json();

  // Validar body con Zod
  const parsed = updatePackageSchema.safeParse(body);

  // Manejar error de validación
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  // Separar package_pieces del resto del paquete
  const { package_pieces, ...packagePayload } = parsed.data;

  // Actualizar paquete principal
  const { data: updatedPackage, error: packageError } = await supabase
    .from("packages")
    // @ts-expect-error tipos desactualizados de Supabase
    .update(packagePayload)
    .eq("id", id)
    .select()
    .single();

  // Manejar error
  if (packageError || !updatedPackage) {
    return NextResponse.json(
      {
        error: "Error al actualizar paquete",
      },
      { status: 500 }
    );
  }

  // Si vienen piezas, reemplazar las piezas anteriores
  if (package_pieces) {
    // Eliminar piezas anteriores
    const { error: deletePiecesError } = await supabase
      .from("package_pieces")
      .delete()
      .eq("package_id", id);

    if (deletePiecesError) {
      return NextResponse.json(
        {
          error: "Error al actualizar piezas del paquete",
        },
        { status: 500 }
      );
    }

    // Insertar nuevas piezas si el array no está vacío
    if (package_pieces.length > 0) {
      const packagePiecesPayload = package_pieces.map((piece) => ({
        package_id: id,
        category_id: piece.category_id,
        quantity: piece.quantity,
      }));

      const { error: insertPiecesError } = await supabase
        .from("package_pieces")
        .insert(packagePiecesPayload);

      if (insertPiecesError) {
        return NextResponse.json(
          {
            error: "Error al actualizar piezas del paquete",
          },
          { status: 500 }
        );
      }
    }
  }

  // Si el paquete se cierra, devolvemos mensaje específico
  const message =
    parsed.data.status === "ended"
      ? "Paquete cerrado correctamente"
      : "Paquete actualizado correctamente";

  // Respuesta exitosa
  return NextResponse.json(
    {
      message,
      data: updatedPackage,
    },
    { status: 200 }
  );
}

// DELETE /api/packages/:id
// Cerrar paquete
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener ID desde params
  const { id } = await params;

  // En este sistema no borramos el paquete físicamente.
  // Lo cerramos cambiando status a ended.
  const { data: endedPackage, error } = await supabase
    .from("packages")
    .update({
      status: "ended",
      end_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", id)
    .select()
    .single();

  // Manejar error
  if (error || !endedPackage) {
    return NextResponse.json(
      {
        error: "Error al cerrar paquete",
      },
      { status: 500 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Paquete cerrado correctamente",
      data: endedPackage,
    },
    { status: 200 }
  );
}
