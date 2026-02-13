import {Recipe, RecipeFilters, RecipeService} from "../../services/api.ts";
import React, {useState} from "react";

interface RecipeFilterProps {
    onFilterApplied: (recipes: Recipe[]) => void;
    onClearFilters: () => void;
}

const RecipeFilter: React.FC<RecipeFilterProps> = ({
    onFilterApplied,
    onClearFilters
}) => {
    const [filters, setFilters] = useState<RecipeFilters>({
        title: "",
        cuisine: "",
        ingredients: "",
        maxCookingTime: undefined
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value === 'maxCookingTime' && value ? parseInt(value, 10) : value
        });
    };

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const activeFilters: RecipeFilters = Object.entries(filters)
                .filter(([_, value]) => value !== '' && value != undefined)
                .reduce((obj, [key, value]) => ({...obj, [key]: value }), {});
            const recipes = await RecipeService.getFilterRecipes(activeFilters);
            onFilterApplied(recipes);
        } catch (err) {
            console.error('Error filtering recipes:', err);
            setError('Failed to filter recipes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFilters({
            title: "",
            cuisine: "",
            ingredients: "",
            maxCookingTime: undefined
        });
        onClearFilters();
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Filter Recipes</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2" htmlFor="title">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={filters.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search by title"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2" htmlFor="cuisine">
                            Cuisine
                        </label>
                        <input
                            type="text"
                            id="cuisine"
                            name="cuisine"
                            value={filters.cuisine}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Italian, Mexican"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2" htmlFor="ingredients">
                            Ingredients
                        </label>
                        <input
                            type="text"
                            id="ingredients"
                            name="ingredients"
                            value={filters.ingredients}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. tomato, basil"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2" htmlFor="maxCookingTime">
                            Max Cooking Time (minutes)
                        </label>
                        <input
                            type="number"
                            id="maxCookingTime"
                            name="maxCookingTime"
                            value={filters.maxCookingTime ?? ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 30"
                            min="1"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Clear Filters
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                    >
                        {loading ? 'Filtering...' : 'Apply Filters'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default RecipeFilter;