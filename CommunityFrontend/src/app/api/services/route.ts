import { NextRequest, NextResponse } from "next/server";

import { sortServicesByAvailability } from "@/features/services/api/get-services";
import type { ServiceApiItem } from "@/features/services/types/service";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  try {
    const payload = await apiConnector<ServiceApiItem[]>(
      "get",
      endpoints.SERVICES.LIST,
      undefined,
      undefined,
      {
        params: category ? { category } : undefined,
      },
    );

    return NextResponse.json(sortServicesByAvailability(payload));
  } catch {
    return NextResponse.json(
      { message: "Unable to load services right now." },
      { status: 500 },
    );
  }
}
