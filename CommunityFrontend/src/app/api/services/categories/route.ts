import { NextResponse } from "next/server";

import type { ServiceCategoryApiItem } from "@/features/services/types/service";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function GET() {
  try {
    const payload = await apiConnector<ServiceCategoryApiItem[]>(
      "get",
      endpoints.SERVICES.CATEGORIES,
    );

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Unable to load service categories right now." },
      { status: 500 },
    );
  }
}
