import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Role = "ADMIN" | "STUDENT" | "PANELIST";
type AuthState = { role: Role; email: string; signedIn: boolean };
type AuthContextValue = AuthState & { signIn: (email: string, role: Role) => void; signOut: () => void };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [auth, setAuth] = useState<AuthState>(() => {
		try { return JSON.parse(localStorage.getItem("placify-auth") || "null") || { role: "ADMIN", email: "", signedIn: false }; }
		catch { return { role: "ADMIN", email: "", signedIn: false }; }
	});
	const value = useMemo(() => ({
		...auth,
		signIn: (email: string, role: Role) => { const next = { role, email, signedIn: true }; setAuth(next); localStorage.setItem("placify-auth", JSON.stringify(next)); },
		signOut: () => { setAuth({ role: "ADMIN", email: "", signedIn: false }); localStorage.removeItem("placify-auth"); },
	}), [auth]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used inside AuthProvider");
	return context;
}
