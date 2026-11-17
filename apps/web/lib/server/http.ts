import "server-only";
import { NextResponse } from "next/server";

/** Respuesta de error con un mensaje para la persona: qué ha pasado y cómo arreglarlo. */
export function errorResponse(status: number, message: string) {
  return NextResponse.json({ status: "error", message }, { status });
}
