import { Link, useNavigate } from "react-router-dom";
import { clearStoredToken } from "../auth";
import { CgProfile } from "react-icons/cg";
import { BsFillBellFill } from "react-icons/bs";

export default function TopBar({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate(); 
  const handleLogout = () => {
    clearStoredToken();
    setIsAuthenticated(false);
    navigate("/"); 
    };

  const TopBarIcon = ({ icon, text = "tooltip", to, onClick }) => {
    const content = (
      <div className="topbar-icon group">
        {icon}
        <div className="topbar-tooltip scale-0 group-hover:scale-100">
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
    <div className="topbar bg-bg flex justify-between items-center px-4 py-2 h-16">
        <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <img src="/images/fluentify_logo_small_cropped_no_bg.png" alt="Logo" className="h-12 w-auto" />
        </Link>
        
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <TopBarIcon 
              icon={<BsFillBellFill size="24" />} 
              text="Notifications" 
              to="/notifications" 
            />
            <TopBarIcon 
              icon={<CgProfile size="24" />} 
              text="Profile" 
              to="/profile" 
            />
            <TopBarIcon 
              icon={<span className="text-sm">Logout</span>} 
              text="Logout" 
              onClick={handleLogout} 
            />
          </div>
        )}
    </div>
);
}    
