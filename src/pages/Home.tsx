import Header from "../components/Header";

const Home = () => {
  return (
    <div className="min-h-screen min-w-screen bg-gray-100">
      <Header />

      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4 text-center">
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
