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
    to?: string;
    onClick?: () => void;
  }

  const SideBarIcon = ({ icon, text = "tooltip", to, onClick }: SideBarIconProps) => {
    const content = (
      <div className="sidebar-icon group">
        {icon}
        <div className="sidebar-tooltip scale-0 group-hover:scale-100">
          {text}
        </div>
      </div>
    );

    if (to) {
      return <Link to={to}>{content}</Link>;
    }

    if (onClick) {
      return <button onClick={onClick}>{content}</button>;
    }

    return content;
  };

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
              to="/"
            />

            {isAuthenticated ? (
              <>
                <SideBarIcon
                  icon={<TbVocabulary size="28" />}
                  text="Vocabulary"
                  to="/vocabulary"
                />
                <SideBarIcon
                  icon={<LuSpeech size="28" />}
                  text="Language practice"
                  to="/chat"
                />
                <SideBarIcon
                  icon={<LuLogOut size="28" />}
                  text="Logout"
                  onClick={handleLogout}
                />
              </>
            ) : (
              <>
                <SideBarIcon
                  icon={<LuLogIn size="28" />}
                  text="Login"
                  to="/login"
                />
                <SideBarIcon
                  icon={<GiArchiveRegister size="28" />}
                  text="Register"
                  to="/register"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
