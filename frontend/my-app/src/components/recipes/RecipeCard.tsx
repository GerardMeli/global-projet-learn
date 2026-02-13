import {Recipe} from "../../services/api.ts";
import React from "react";

interface RecipeCardProps {
    recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({recipe}) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
                <p className="text-gray-600 mb-3">
                    <span className="font-medium">Cuisine:</span> {recipe.cuisine}
                </p>
                <p className="text-gray-600 mb-3">
                    <span className="font-medium">Cooking Time:</span> {recipe.cookingTime} minutes
                </p>
                <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-1">Description:</h4>
                    <p className="text-gray-600">{recipe.description}</p>
                </div>
                <div>
                    <h4 className="font-medium text-gray-700 mb-1">Ingredients:</h4>
                    <p className="text-gray-600">{recipe.ingredients}</p>
                </div>
            </div>
        </div>
    );
}

export default RecipeCard;