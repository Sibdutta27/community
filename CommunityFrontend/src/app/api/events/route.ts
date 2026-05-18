import { NextRequest, NextResponse } from "next/server";

import type { CommunityEventApiItem } from "@/features/community/types/community-event";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  try {
    const payload = await apiConnector<CommunityEventApiItem[]>(
      "get",
      endpoints.EVENTS.LIST,
      undefined,
      undefined,
      {
        params: category ? { category } : undefined,
      },
    );

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Unable to load community events right now." },
      { status: 500 },
    );
  }
}
