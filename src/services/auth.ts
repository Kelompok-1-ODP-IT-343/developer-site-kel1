import coreApi from "@/lib/coreApi";

export type LoginPayload = {
  username?: string;
  email?: string;
  password: string;
};

export type AuthSuccess = {
  success: true;
  token: string;
  user: { id: string; name: string; email?: string };
};

export type AuthFailure = {
  success: false;
  message: string;
};

// Blueprint login: panggilan API asli dikomentari, return success
export async function loginBlueprint(
  payload: LoginPayload
): Promise<AuthSuccess | AuthFailure> {
  // --- Contoh panggilan API asli (dikomentari sesuai permintaan) ---
  // try {
  //   const res = await coreApi.post("/auth/login", payload)
  //   const data = res.data // { token, user }
  //   if (typeof window !== "undefined") {
  //     localStorage.setItem("access_token", data.token)
  //   }
  //   return { success: true, token: data.token, user: data.user }
  // } catch (err: any) {
  //   const message = err?.response?.data?.message || "Login gagal"
  //   return { success: false, message }
  // }
  let _ = coreApi;

  _ = _;

  // --- Blueprint (dummy) ---
  const mockToken = "demo-token";
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("access_token", mockToken);
      localStorage.setItem(
        "user_name",
        payload.username || payload.email || "Demo User"
      );
    } catch (_) {
      // abaikan jika localStorage tidak tersedia
    }
  }

  return {
    success: true,
    token: mockToken,
    user: {
      id: "0",
      name: payload.username || "Demo User",
      email: payload.email,
    },
  };
}
