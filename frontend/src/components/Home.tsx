import { Link } from "react-router-dom";
import { LuLogIn } from "react-icons/lu";
import { GiArchiveRegister } from "react-icons/gi";

interface HomeProps {
  isAuthenticated: boolean;
}

export default function Home({ isAuthenticated }: HomeProps) {
  if (isAuthenticated) {
    return (
      <div className="bg-white min-h-[calc(100vh-4rem)]">
        {/* Empty home page for authenticated users - only navigation will be visible */}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg items-center justify-center relative">
      {/* Background Image */}
      <img 
        src="/images/owl_logo_no_bg.png" 
        alt="Fluentify Background" 
        className="absolute inset-0  h-full object-cover"
      />
      
      <div className="text-center relative z-10">
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">Fluentify</h1>
          <p className="text-xl text-white drop-shadow-xl">Master languages through conversation</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            to="/login"
            className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <LuLogIn size="24" />
            <span className="text-lg font-semibold">Login</span>
          </Link>
          
          <Link
            to="/register"
            className="group flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <GiArchiveRegister size="24" />
            <span className="text-lg font-semibold">Register</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
