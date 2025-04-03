import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen min-w-screen bg-gray-100 relative">
      {/* Botões de login e registro no canto superior direito */}
      <div className="absolute top-10 right-10 flex gap-6">
        <button
          onClick={() => navigate("/login")}
          className="text-sm bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full cursor-pointer"
        >
          Entrar
        </button>
        <button
          onClick={() => navigate("/registro")}
          className="text-sm bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full cursor-pointer"
        >
          Cadastro
        </button>
      </div>

      <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
          Bem-vindo ao <span className="text-purple-600">Alugaí</span>!
        </h1>
        <p className="text-gray-600 text-lg sm:text-xl max-w-xl">
          Encontre, gerencie e alugue espaços profissionais com facilidade.
        </p>
      </div>
    </div>
  );
};

export default Home;
