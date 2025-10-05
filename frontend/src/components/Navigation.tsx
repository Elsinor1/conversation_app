import { Link, useNavigate } from "react-router-dom";
import { clearStoredToken } from "../auth";
import { LuSpeech, LuLogIn, LuLogOut } from "react-icons/lu";
import { TbVocabulary } from "react-icons/tb";
import { GoHomeFill } from "react-icons/go";
import { GiArchiveRegister } from "react-icons/gi";

interface NavigationProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export default function Navigation({
  isAuthenticated,
  onLogout,
}: NavigationProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearStoredToken();
    onLogout();
    navigate("/");
  };

  interface SideBarIconProps {
    icon: React.ReactNode;
    text?: string;
  }

  const SideBarIcon = ({ icon, text = "tooltip" }: SideBarIconProps) => (
    <div className="sidebar-icon group">
      {icon}
      <div className="sidebar-tooltip scale-0 group-hover:scale-100">
        {text}
      </div>
    </div>
  );

  return (
    <nav className="flex">
      <div className="">
        <div className="">
          <div
            className="fixed top-0 left-0 h-screen w-48
            flex flex-col 
            bg-gray-900 text-white shadow"
          >
            <SideBarIcon
              icon={<GoHomeFill size="28" />}
              text="Home"
            ></SideBarIcon>
            <Link to="/" className=""></Link>

            {isAuthenticated ? (
              <>
                <SideBarIcon
                  icon={<TbVocabulary size="28" />}
                  text="Vocabulary"
                ></SideBarIcon>
                <Link to="/vocabulary" className=""></Link>
                <SideBarIcon
                  icon={<LuSpeech size="28" />}
                  text="Language practice"
                ></SideBarIcon>
                <Link to="/chat" className=""></Link>
                <SideBarIcon
                  icon={<LuLogOut size="28" />}
                  text="Logout"
                ></SideBarIcon>
                <button onClick={handleLogout} className=""></button>
              </>
            ) : (
              <>
                <SideBarIcon
                  icon={<LuLogIn size="28" />}
                  text="Login"
                ></SideBarIcon>
                <Link to="/login" className=""></Link>
                <SideBarIcon
                  icon={<GiArchiveRegister size="28" />}
                  text="Register"
                ></SideBarIcon>
                <Link to="/register" className=""></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
