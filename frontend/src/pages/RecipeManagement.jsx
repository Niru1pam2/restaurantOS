import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/useAuthStore';

const INITIAL_RECIPES = [
  {
    id: 1,
    dish: 'Truffle Mushroom Risotto',
    servings: 2,
    prepTime: '15 mins',
    cookTime: '25 mins',
    costPerServing: '$6.40',
    ingredients: [
      { name: 'Arborio Rice', amount: '200g' },
      { name: 'Truffle Oil', amount: '15ml' },
      { name: 'Button Mushrooms', amount: '150g' },
      { name: 'Parmesan Cheese', amount: '50g' }
    ],
    steps: ['Sauté mushrooms in olive oil', 'Toast arborio rice until translucent', 'Slowly add warm vegetable stock while stirring', 'Finish with truffle oil and parmesan']
  },
  {
    id: 2,
    dish: 'Wagyu Beef Burger',
    servings: 1,
    prepTime: '10 mins',
    cookTime: '12 mins',
    costPerServing: '$8.10',
    ingredients: [
      { name: 'Wagyu Beef Patty', amount: '200g' },
      { name: 'Brioche Bun', amount: '1 pc' },
      { name: 'Aged Cheddar', amount: '2 slices' },
      { name: 'Caramelized Onion', amount: '40g' }
    ],
    steps: ['Sear patty on high heat for 3 mins per side', 'Melt cheddar cheese on top', 'Toast brioche bun with butter', 'Assemble with caramelized onions and sauce']
  }
];

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState(INITIAL_RECIPES[0]);
  const [modal, setModal] = useState(false);
  const user = useAuth((s) => s.user);

  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Recipe Management</h1>
            <p className="text-slate-400 text-sm">Standardized culinary recipes, ingredient ratios & kitchen prep instructions</p>
          </div>
          {['OWNER', 'MANAGER', 'CHEF'].includes(user?.role) && (
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">+ New Recipe</button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipe List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">All Recipes ({recipes.length})</h2>
            {recipes.map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedRecipe(r)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedRecipe?.id === r.id ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
              >
                <h3 className="font-bold text-base">{r.dish}</h3>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>Prep + Cook: {r.prepTime}</span>
                  <span className="font-semibold text-emerald-400">{r.costPerServing}/serving</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Recipe Details */}
          {selectedRecipe && (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedRecipe.dish}</h2>
                  <p className="text-xs text-slate-400 mt-1">Servings: {selectedRecipe.servings} | Est. Cost: {selectedRecipe.costPerServing}</p>
                </div>
                <span className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/30">
                  Prep: {selectedRecipe.prepTime} | Cook: {selectedRecipe.cookTime}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Required Ingredients</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <p className="text-xs font-bold text-white">{ing.name}</p>
                      <p className="text-xs text-indigo-400 font-mono mt-0.5">{ing.amount}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Preparation Steps</h3>
                <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {selectedRecipe.steps.map((st, idx) => (
                    <li key={idx} className="leading-relaxed"><span className="text-slate-200">{st}</span></li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold text-white">Create Recipe</h3>
              <form onSubmit={(e) => { e.preventDefault(); const newR = { id: Date.now(), dish: 'New Special Dish', servings: 2, prepTime: '15m', cookTime: '15m', costPerServing: '$5.00', ingredients: [{ name: 'Main Ingredient', amount: '200g' }], steps: ['Mix and cook well'] }; setRecipes([...recipes, newR]); setSelectedRecipe(newR); setModal(false); }} className="space-y-3">
                <input type="text" required placeholder="Dish Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <input type="text" required placeholder="Prep & Cook Time" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Save Recipe</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
