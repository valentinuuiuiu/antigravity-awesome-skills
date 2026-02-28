const fs = require('fs');
let code = fs.readFileSync('postare_page.tsx', 'utf8');

const imports = `import { Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';`;
code = code.replace(/import \{ Eye, EyeOff \} from 'lucide-react';/, imports);

if (!code.includes('const [aiPrice')) {
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
}

const priceInputSection = `
            <div className="space-y-2">
              <label className="block text-lg font-bold mb-4 text-[#00f0ff]">💶 Preț (EUR)</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full p-6 rounded-2xl bg-white/5 border-2 border-[#00f0ff]/30 text-white focus:border-[#00f0ff] transition-colors outline-none"
                    placeholder="ex: 15000"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={getAiPriceSuggestion}
                  disabled={aiLoading || !formData.title || !formData.category_id}
                  className="flex items-center gap-2 px-6 py-6 bg-[#00f0ff]/20 text-[#00f0ff] border-2 border-[#00f0ff]/30 rounded-2xl hover:bg-[#00f0ff]/30 transition-colors disabled:opacity-50"
                  title="Obține sugestie de preț cu AI pe baza pieței din România"
                >
                  {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Sugestie AI
                </button>
              </div>

              {aiPrice && (
                <div className="mt-4 p-4 bg-purple-900/40 border border-[#00f0ff]/40 rounded-xl text-sm">
                  <p className="text-[#00f0ff] font-medium mb-1">
                    Preț recomandat de AI: <span className="font-bold text-white text-lg">{aiPrice.suggestedPrice} RON</span>
                  </p>
                  <p className="text-gray-300 text-xs mb-2">
                    Interval piață: <span className="text-white">{aiPrice.minPrice} - {aiPrice.maxPrice} RON</span>
                  </p>
                  <p className="text-gray-300 mt-2 text-sm italic border-t border-purple-500/30 pt-2">
                    "{aiPrice.insight}"
                  </p>
                </div>
              )}
            </div>
`;

code = code.replace(/<div>\s*<label className="block text-lg font-bold mb-4 text-\[#00f0ff\]">💶 Preț \(EUR\)<\/label>[\s\S]*?onChange=\{\(e\) => setFormData\(prev => \(\{ \.\.\.prev, price: e\.target\.value \}\)\)\}[\s\S]*?required\s*\/>\s*<\/div>/, priceInputSection);

fs.writeFileSync('postare_page_patched.tsx', code);
