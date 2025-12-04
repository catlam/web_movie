import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaHeart } from "react-icons/fa";
import { useSelector } from "react-redux";
import { CgUser } from "react-icons/cg";
import { FiBell } from "react-icons/fi";
import NotificationModal from "../../Components/Modals/NotificationModal";

function NavBar() {
  const [search, setSearch] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.userLogin);
  const { likedMovies } = useSelector((state) => state.userGetFavoriteMovies);
  const { unreadCount } = useSelector((state) => state.notifications);

  const hover = "hover:text-subMain transitions text-white";
  const Hover = ({ isActive }) => (isActive ? "text-subMain" : hover);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/movies/${search}`);
    } else {
      navigate("/movies");
    }
    setSearch("");
  };

  return (
    <>
      <div className="bg-main shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-6">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/">
                <img
                  src="/images/logo.png"
                  alt="logo"
                  className="h-11 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="w-full">
                <div className="flex items-center bg-dryGray rounded-lg overflow-hidden shadow-sm">
                  <button
                    type="submit"
                    className="bg-subMain text-white w-12 h-11 flex items-center justify-center"
                  >
                    <FaSearch className="text-lg" />
                  </button>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Movie Name..."
                    className="w-full h-11 px-4 text-sm bg-transparent outline-none text-black placeholder:text-gray-500"
                  />
                </div>
              </form>
            </div>

            {/* Right side: Menu + Icons */}
            <div className="flex items-center gap-8">

              {/* Menu chữ (chỉ hiện từ tablet trở lên) */}
              <div className="hidden md:flex items-center gap-7 xl:gap-9 text-white font-medium text-sm">
                <NavLink to="/movies" className={Hover}>Movies</NavLink>
                <NavLink to="/about-us" className={Hover}>About</NavLink>
                <NavLink to="/contact-us" className={Hover}>Contact</NavLink>
              </div>

              <div className="flex items-center gap-6 text-white">
                {/* Notification */}
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="relative hover:text-subMain transitions"
                >
                  <FiBell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-subMain text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Favorites */}
                <NavLink to="/favorites" className="relative hover:text-subMain transitions">
                  <FaHeart className="w-6 h-6" />
                  {(likedMovies?.length ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-subMain text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {likedMovies.length > 99 ? "99+" : likedMovies.length}
                    </span>
                  )}
                </NavLink>

                {/* User Avatar */}
                <NavLink
                  to={userInfo?.isAdmin ? "/dashboard" : userInfo ? "/profile" : "/login"}
                  className="hover:text-subMain transitions"
                >
                  {userInfo ? (
                    <img
                      src={userInfo.image || "/images/user.png"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-subMain"
                    />
                  ) : (
                    <CgUser className="w-9 h-9" />
                  )}
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NotificationModal open={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
}

export default NavBar;