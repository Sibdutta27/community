import { screen } from "@testing-library/react";
import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";

import type { AuthUser } from "@/lib/auth";
import { renderWithIntl } from "@/test/i18n";

import esMessages from "../../../../messages/es.json";
import {
  buildProfileViewData,
  type ProfileTranslator,
} from "../lib/profile-view-data";
import { ProfileOverviewPanel } from "./profile-overview-panel";

const esTranslator = createTranslator({
  locale: "es",
  messages: esMessages,
  namespace: "profile",
}) as unknown as ProfileTranslator;

const authUser: AuthUser = {
  id: "user-1",
  publicId: "TN-0001-TST",
  name: "Ana Rivera",
  email: "ana@example.com",
  role: "USER",
};

describe("ProfileOverviewPanel (es)", () => {
  it("renders the overview section in Puerto Rican Spanish", () => {
    const { overviewData } = buildProfileViewData({
      accountInfo: null,
      authUser,
      t: esTranslator,
    });

    renderWithIntl(<ProfileOverviewPanel overviewData={overviewData} />, "es");

    // Section chrome translated by the component itself.
    expect(screen.getByText("Resumen personal")).toBeInTheDocument();
    expect(screen.getByText("Resumen de contacto")).toBeInTheDocument();
    expect(
      screen.getByText("Lista de verificación de inscripción"),
    ).toBeInTheDocument();

    // Labels flowing through the view-data mapper.
    expect(screen.getByText("Ancestros registrados")).toBeInTheDocument();
    expect(screen.getByText("Estado de inscripción")).toBeInTheDocument();
    expect(screen.getByText("No iniciada")).toBeInTheDocument();
  });
});
