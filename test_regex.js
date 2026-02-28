const fs = require('fs');
let code = fs.readFileSync('postare_page.tsx', 'utf8');
const match = code.match(/<div className="space-y-2">\s*<label className="block text-sm font-medium text-gray-300">\s*Preț \[\s\S]*?<\/div>/);
console.log(match ? "Matched" : "Not matched");
const priceInputSection = `
          {/* Preț */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Preț (RON) *
            </label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ex: 150"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={getAiPriceSuggestion}
                disabled={aiLoading || !formData.title || !formData.category_id}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Sugestie Preț AI
              </button>
            </div>
          </div>
`;
code = code.replace(/<div className="space-y-2">\s*<label className="block text-sm font-medium text-gray-300">\s*Preț \(RON\) \*[\s\S]*?onChange=\{\(e\) => setFormData\(prev => \(\{ \.\.\.prev, price: e\.target\.value \}\)\)\}\s*\/>\s*<\/div>/, priceInputSection);
console.log(code.includes("Sugestie Preț AI") ? "Replaced" : "Not replaced");
