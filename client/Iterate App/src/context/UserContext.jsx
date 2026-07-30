import { createContext, useContext, useEffect, useState, useCallback } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/users/", { credentials: "include" }).then(r => r.json());
      setUser(res?.data ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetchUser(); }, [refetchUser]);

  return (
    <UserContext.Provider value={{ user, loading, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}