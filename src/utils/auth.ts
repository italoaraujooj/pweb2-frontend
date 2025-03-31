// utils/auth.ts
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  id: string;
  role: string;
  // outros campos, se necessário
};

export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token); 
    return decoded.id;
  } catch (error) {
    console.error("Token inválido:", error);
    return null;
  }
};
