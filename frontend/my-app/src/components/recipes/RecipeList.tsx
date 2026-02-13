import React, {useEffect, useState} from "react";
import {PageRecipe, Recipe, RecipeService} from "../../services/api.ts";
import RecipeFilter from "./RecipeFilter.tsx";
import RecipeCard from "./RecipeCard.tsx";
import Pagination from "../ui/Pagination.tsx";

const RecipeList: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const pageSize = 6;
    const [pageData, setPageData] = useState<PageRecipe | null>(null);
    const [isFiltering, setIsFiltering] = useState<boolean>(false);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const data = await RecipeService.getRecipes(page, pageSize);
            setRecipes(data.content);
            setPageData(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError('Failed to load recipes. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isFiltering) {
            fetchRecipes();
        }
    }, [page, isFiltering]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleFilterApplied = (filteredRecipes: Recipe[]) => {
        setRecipes(filteredRecipes);
        setIsFiltering(true);
    };

    const handleClearFilters = () => {
        setIsFiltering(false);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6">Recipes</h2>

            <RecipeFilter
                onFilterApplied={handleFilterApplied}
                onClearFilters={handleClearFilters}
            />

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {recipes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No recipes found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe}/>
                            ))}
                        </div>
                    )}

                    {!isFiltering && pageData && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={page}
                                totalPages={pageData.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default RecipeList;