import { Link } from "react-router-dom";
import { LuSpeech, LuLogIn } from "react-icons/lu";
import { TbVocabulary } from "react-icons/tb";
import { GoHomeFill } from "react-icons/go";
import { GiArchiveRegister } from "react-icons/gi";

interface NavigationProps {
  isAuthenticated: boolean;
}

export default function Navigation({
  isAuthenticated,
}: NavigationProps) {

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
            className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-18
            flex flex-col 
            bg-primary text-white shadow"
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
                  to="/practice-setup"
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
