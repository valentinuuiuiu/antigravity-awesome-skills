const fs = require('fs');
let code = fs.readFileSync('postare_page.tsx', 'utf8');

const imports = `import { Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';`;
code = code.replace(/import \{ Eye, EyeOff \} from 'lucide-react';/, imports);

const aiStates = `
  const [aiPrice, setAiPrice] = useState<{ suggestedPrice: number; minPrice: number; maxPrice: number; insight: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const getAiPriceSuggestion = async () => {
    if (!formData.title || !formData.category_id || !formData.location) {
      alert('Vă rugăm să completați titlul, categoria și locația pentru a obține o sugestie de preț.');
      return;
    }

    setAiLoading(true);
    try {
      const selectedCategory = categories.find(c => c.id.toString() === formData.category_id.toString());
      const categoryName = selectedCategory ? selectedCategory.name : '';

      const res = await fetch(\`/api/price-suggest?title=\${encodeURIComponent(formData.title)}&category=\${encodeURIComponent(categoryName)}&location=\${encodeURIComponent(formData.location)}\`);

      if (!res.ok) throw new Error('Failed to get price suggestion');

      const data = await res.json();
      setAiPrice(data);
      if (data.suggestedPrice) {
        setFormData(prev => ({ ...prev, price: data.suggestedPrice.toString() }));
      }
    } catch (err) {
      console.error('Error fetching AI price:', err);
      alert('Eroare la obținerea sugestiei de preț. Vă rugăm să încercați din nou.');
    } finally {
      setAiLoading(false);
    }
  };
`;
code = code.replace(/const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);/, match => match + '\n' + aiStates);

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

            {aiPrice && (
              <div className="mt-2 p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg text-sm">
                <p className="text-purple-300 font-medium mb-1">
                  Preț recomandat de AI: <span className="font-bold text-white">{aiPrice.suggestedPrice} RON</span>
                </p>
                <p className="text-gray-400 text-xs">
                  Interval piață: {aiPrice.minPrice} - {aiPrice.maxPrice} RON
                </p>
                <p className="text-gray-300 mt-2 text-xs italic">
                  "{aiPrice.insight}"
                </p>
              </div>
            )}
          </div>
`;

code = code.replace(/<div className="space-y-2">\s*<label className="block text-sm font-medium text-gray-300">\s*Preț \(RON\) \*\s*<\/label>\s*<input[\s\S]*?onChange=\{\(e\) => setFormData\(prev => \(\{ \.\.\.prev, price: e\.target\.value \}\)\)\}\s*\/>\s*<\/div>/, priceInputSection);

fs.writeFileSync('postare_page_patched.tsx', code);
