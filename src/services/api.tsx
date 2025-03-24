import axios from "axios";

// Configuração base da API
const api = axios.create({
  baseURL: "http://localhost:3000", // Altere para o endereço do seu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Obtém o token armazenado
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Erro de autenticação, redirecionando para login...");
      localStorage.removeItem("token"); // Remove token inválido
      window.location.href = "/"; // Redireciona para login
    }
    return Promise.reject(error);
  }
);

// Métodos de API para reutilização no código
export const AuthService = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    profession: string;
  }) => api.post("/auth/register", data),

  getUser: () => api.get("/users/me"),
};

export const RentService = {
  getAvailablePlaces: (page: number, limit: number) =>
    api.get(`/places/available?page=${page}&limit=${limit}`),

  requestRent: (data: { placeId: string; schedules: any[] }) =>
    api.post("/rents/request", data),

  approveRent: (id: string, status: "approved" | "rejected") =>
    api.put(`/rents/${id}/approve`, { status }),

  cancelRent: (id: string) => api.put(`/rents/${id}/cancel`),

  getUserRents: () => api.get("/rents/me"),
};

export const UserService = {
  getAllUsers: () => api.get("/users"),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export const PlaceService = {
  createPlace: (data: {
    name: string;
    description: string;
    pricePerTurn: number;
    availability: { day: string; availableTurns: string[] }[];
    address: {
      cep: string;
      pais: string;
      estado: string;
      cidade: string;
      bairro: string;
      rua: string;
      numero: string;
      complemento?: string;
    };
  }) => api.post("/places", data),
};

export default api;
