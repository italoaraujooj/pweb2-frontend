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

  requestRent: (data: {
    placeId: string;
    ownerId: string;
    renterId: string;
    totalValue: number;
    status: string;
    paymentMethod: string;
    schedules: { day: string; turns: string[] }[];
  }) => api.post("/rents/request", data),

  approveRent: (id: string, status: "confirmado" | "rejeitado") =>
    api.put(`/rents/${id}/approve`, { status }),

  cancelRent: (id: string) => api.put(`/rents/${id}/cancel`),

  getUserRents: () => api.get("/rents/me"),

  finalizeRent: (id: string) => api.put(`/rents/${id}/finalize`),
};

export const UserService = {
  getAllUsers: () => api.get("/users"),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  updateProfileImage: (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("userId", userId);

    return api.patch(`/users/upload-profile-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
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

  getOwnPlaces: () => api.get("/places/own"),

  getPlaceById: (id: string) => api.get(`/places/${id}`),

  updatePlace: (id: string, data: any) => api.put(`/places/${id}`, data),

  deletePlace: (id: string) => api.delete(`/places/${id}`),
};

export const RatingService = {
  // Avaliação de usuário
  rateUser: async (payload: {
    reviewerId: string;
    reviewedId: string;
    rentId: string;
    rating: number;
    description?: string;
  }) => {
    return await api.post("/ratings/user", payload);
  },

  getRatingsByUser: (reviewerId: string) =>
    api.get(`/ratings/user/${reviewerId}`),

  // Avaliação de espaço
  ratePlace: async (payload: {
    reviewerId: string;
    reviewedId: string;
    rentId: string;
    rating: number;
    description?: string;
  }) => {
    return await api.post("/ratings/place", payload);
  },

  // Recuperar todas as avaliações
  getAllRatings: async () => {
    return await api.get("/ratings");
  },

  // Buscar avaliação por ID
  getRatingById: async (id: string) => {
    return await api.get(`/ratings/${id}`);
  },

  // Deletar avaliação
  deleteRating: async (id: string) => {
    return await api.delete(`/ratings/${id}`);
  },

  // Atualizar média de um usuário
  updateUserAverageRating: async (userId: string) => {
    // Endpoint separado para isso seria ideal, mas se for interno, pode usar getUser/updateUser também
    return await api.put(`/users/${userId}/average-rating`);
  },

  // Atualizar média de um espaço
  updatePlaceAverageRating: async (placeId: string) => {
    return await api.put(`/places/${placeId}/average-rating`);
  },
};

export default api;
