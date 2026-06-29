import { NextResponse } from "next/server";

import type { CommunityEventCategory } from "@/features/community/types/community-event";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function GET() {
  try {
    const payload = await apiConnector<CommunityEventCategory[]>(
      "get",
      endpoints.EVENTS.CATEGORIES,
    );

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Unable to load event categories right now." },
      { status: 500 },
    );
  }
}
