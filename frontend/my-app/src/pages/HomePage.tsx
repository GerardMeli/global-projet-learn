import {AuthService} from "../services/api.ts";
import React from "react";
import {Link} from "react-router-dom";

const HomePage: React.FC = () => {
    const isAuthenticated = AuthService.isAuthenticated();

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <h1 className="text-4xl font-bold mb-6 text-center">Welcome to Recipe App</h1>
            <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
                Discover delicious recipes from around the world, filter by cuisine or ingredients,
                and find the perfect meal for any occasion.
            </p>

            {isAuthenticated ? (
                <Link
                    to="/recipes"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md shadow-md"
                >
                    Browse Recipes
                </Link>
            ) : (
                <div className="flex space-x-4">
                    <Link
                        to="/login"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md shadow-md"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-md shadow-md"
                    >
                        Register
                    </Link>
                </div>
            )}
        </div>
    );
}

export default HomePage;