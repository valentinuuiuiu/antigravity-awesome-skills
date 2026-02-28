const fs = require('fs');
let code = fs.readFileSync('ChatbotWidget.tsx', 'utf8');

const enhancedSendMessage = `
  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      // Interceptare intenții specifice pieței
      const lowerMsg = userMessage.toLowerCase();

      // 1. Căutare anunțuri
      if (lowerMsg.includes('caut') || lowerMsg.includes('găsesc') || lowerMsg.includes('vreau să cumpăr')) {
        const query = encodeURIComponent(userMessage);
        try {
          const searchRes = await fetch(\`/api/anunturi?q=\${query}&limit=3\`);
          if (searchRes.ok) {
            const data = await searchRes.json();
            if (data.anunturi && data.anunturi.length > 0) {
              const resultsText = "Uite ce am găsit:\\n" + data.anunturi.map((a: any) => \`- \${a.title} (\${a.price} RON)\\n  \${a.images?.[0] ? \`[Imagine](\${a.images[0]})\` : ''}\`).join('\\n');
              setMessages((prev) => [...prev, { text: resultsText, sender: 'fannymae' }]);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Eroare la căutarea anunțurilor:", e);
        }
      }

      // 2. Sugestie de preț
      if (lowerMsg.includes('cât costă') || lowerMsg.includes('preț') || lowerMsg.includes('cât valorează') || lowerMsg.includes('evaluare')) {
         const parts = userMessage.split(' ');
         const potentialItem = parts.slice(Math.max(0, parts.indexOf('costă') + 1, parts.indexOf('preț') + 1)).join(' ');

         if (potentialItem.length > 3) {
           try {
             const priceRes = await fetch(\`/api/price-suggest?title=\${encodeURIComponent(potentialItem)}&category=diverse&location=România\`);
             if (priceRes.ok) {
               const priceData = await priceRes.json();
               if (priceData.suggestedPrice) {
                 setMessages((prev) => [...prev, {
                   text: \`Conform analizei mele, prețul recomandat pentru "\${potentialItem}" este \${priceData.suggestedPrice} RON (între \${priceData.minPrice} și \${priceData.maxPrice} RON). \${priceData.insight}\`,
                   sender: 'fannymae'
                 }]);
                 setIsLoading(false);
                 return;
               }
             }
           } catch (e) {
             console.error("Eroare la obținerea sugestiei de preț:", e);
           }
         }
      }

      // 3. Postare anunț
      if (lowerMsg.includes('postez') || lowerMsg.includes('adaug') || lowerMsg.includes('vând')) {
         setMessages((prev) => [...prev, { text: "Te pot ajuta să postezi un anunț! Mergi la secțiunea 'Adaugă Anunț' (butonul mare din meniu). Completează titlul și categoria, și apasă butonul 'Sugestie AI' la preț pentru a te ajuta să-l vinzi mai repede!", sender: 'fannymae' }]);
         setIsLoading(false);
         return;
      }

      // Fallback la API-ul FannyMae
      const response = await axios.post(
        'http://localhost:8000/api/agents/say', // Target FannyMae API
        {
          message: userMessage,
          persona: 'fannymae',
          page_context: pageContext, // Include page context
          model: 'moonshotai/kimi-k2.5', // Ensure we use Kimi
          system: "You are FannyMae, the AI assistant of piata-ai.ro Romanian marketplace. Help users find the best deals, post ads, and navigate the platform. Always respond in Romanian. You have access to real marketplace data."
        },
        {
          headers: {
            'X-Admin-Email': 'ionutbaltag3@gmail.com', // Bypass auth for testing
            'Content-Type': 'application/json',
          },
        }
      );
`;

code = code.replace(/const sendMessage = async \(\) => \{[\s\S]*?'Content-Type': 'application\/json',\s*\},?\s*\}\s*\);/, enhancedSendMessage);

fs.writeFileSync('ChatbotWidget_patched.tsx', code);
