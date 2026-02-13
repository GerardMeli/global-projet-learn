import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {AuthService} from "../../services/api.ts";

const NavBar: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = AuthService.isAuthenticated();

    const handleLogout = () => {
        AuthService.logout();
        navigate("/login")
    }

    return (
        <nav className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold">Recipe App</Link>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/recipes" className="hover:text-blue-200">Recipes</Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-blue-200">Login</Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;