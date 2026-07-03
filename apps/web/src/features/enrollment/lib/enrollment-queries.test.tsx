import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useEnrollmentDocumentUploadMutation } from "@/features/enrollment/lib/enrollment-queries";

const MB = 1024 * 1024;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

function buildFile(name: string, type: string, size: number): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const presignPayload = {
  uploadUrl: "https://storage.example/presigned-put",
  key: "enrollment/enr-1/USER_PHOTO/uuid-photo.jpg",
  headers: { "Content-Type": "image/jpeg" },
  method: "PUT",
} as const;

const confirmPayload = {
  message: "Document uploaded successfully",
  document: {
    id: "doc-1",
    type: "USER_PHOTO",
    fileName: "photo.jpg",
    fileKey: presignPayload.key,
    fileSize: 2 * MB,
    mimeType: "image/jpeg",
    url: "https://storage.example/presigned-get",
  },
} as const;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useEnrollmentDocumentUploadMutation — presigned direct-to-storage flow", () => {
  it("presigns, PUTs the file directly to storage, then confirms", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(presignPayload))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(jsonResponse(confirmPayload));
    vi.stubGlobal("fetch", fetchMock);

    const file = buildFile("photo.jpg", "image/jpeg", 2 * MB);
    const { result } = renderHook(
      () => useEnrollmentDocumentUploadMutation(),
      { wrapper: createWrapper() },
    );

    const response = await result.current.mutateAsync({
      documentType: "USER_PHOTO",
      file,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);

    // 1) presign via the BFF
    const [presignUrl, presignInit] = fetchMock.mock.calls[0];
    expect(String(presignUrl)).toBe("/api/document/presign-upload");
    expect(presignInit?.method).toBe("POST");
    expect(JSON.parse(String(presignInit?.body))).toEqual({
      documentType: "USER_PHOTO",
      fileName: "photo.jpg",
      mimeType: "image/jpeg",
      fileSize: 2 * MB,
    });

    // 2) direct PUT to storage (not through the BFF)
    const [putUrl, putInit] = fetchMock.mock.calls[1];
    expect(String(putUrl)).toBe(presignPayload.uploadUrl);
    expect(putInit?.method).toBe("PUT");
    expect(putInit?.body).toBe(file);
    expect(new Headers(putInit?.headers).get("Content-Type")).toBe(
      "image/jpeg",
    );

    // 3) confirm via the BFF
    const [confirmUrl, confirmInit] = fetchMock.mock.calls[2];
    expect(String(confirmUrl)).toBe("/api/document/confirm");
    expect(confirmInit?.method).toBe("POST");
    expect(JSON.parse(String(confirmInit?.body))).toEqual({
      documentType: "USER_PHOTO",
      key: presignPayload.key,
      fileName: "photo.jpg",
      mimeType: "image/jpeg",
      fileSize: 2 * MB,
    });

    expect(response).toEqual(confirmPayload);
  });

  it("surfaces a storage upload failure and never confirms", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(presignPayload))
      .mockResolvedValueOnce(new Response(null, { status: 403 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(
      () => useEnrollmentDocumentUploadMutation(),
      { wrapper: createWrapper() },
    );

    await expect(
      result.current.mutateAsync({
        documentType: "USER_PHOTO",
        file: buildFile("photo.jpg", "image/jpeg", 2 * MB),
      }),
    ).rejects.toThrow(/upload/i);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("surfaces a presign rejection message from the backend", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse(
          { message: "Invalid file type for USER_PHOTO: application/pdf." },
          400,
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(
      () => useEnrollmentDocumentUploadMutation(),
      { wrapper: createWrapper() },
    );

    await expect(
      result.current.mutateAsync({
        documentType: "USER_PHOTO",
        file: buildFile("photo.pdf", "application/pdf", 1 * MB),
      }),
    ).rejects.toThrow(/Invalid file type/);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("save-draft mutations — Save & finish later", () => {
  it.each([
    ["step1", "/api/enrollment/step1/save-draft", { firstName: "Ana" }],
    [
      "step2",
      "/api/enrollment/step2/save-draft",
      { mother: { name: "Carmen" } },
    ],
    [
      "step3",
      "/api/enrollment/step3/save-draft",
      { father: { name: "Luis" } },
    ],
  ] as const)(
    "POSTs the partial %s payload to its BFF save-draft route",
    async (step, expectedUrl, payload) => {
      const fetchMock = vi
        .fn<typeof fetch>()
        .mockResolvedValue(jsonResponse({ success: true }));
      vi.stubGlobal("fetch", fetchMock);

      const {
        useEnrollmentStepOneSaveDraftMutation,
        useEnrollmentStepTwoSaveDraftMutation,
        useEnrollmentStepThreeSaveDraftMutation,
      } = await import("@/features/enrollment/lib/enrollment-queries");
      const hook =
        step === "step1"
          ? useEnrollmentStepOneSaveDraftMutation
          : step === "step2"
            ? useEnrollmentStepTwoSaveDraftMutation
            : useEnrollmentStepThreeSaveDraftMutation;

      const { result } = renderHook(() => hook(), {
        wrapper: createWrapper(),
      });

      const response = await result.current.mutateAsync(payload as never);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toBe(expectedUrl);
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual(payload);
      expect(response).toEqual({ success: true });
    },
  );
});
