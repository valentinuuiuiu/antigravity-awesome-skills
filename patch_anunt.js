const fs = require('fs');
let code = fs.readFileSync('anunt_page.tsx', 'utf8');

const structuredDataSnippet = `
  // Funcție pentru formatarea imaginilor
  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : \`https://piata-ai.ro\${url}\`;
  };

  const imagesList = Array.isArray(listing.images) ? listing.images :
                    typeof listing.images === 'string' ? JSON.parse(listing.images || '[]') : [];

  const mainImage = imagesList.length > 0 ? getImageUrl(imagesList[0]) : '';

  // Generare Structured Data JSON-LD pentru Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": listing.title,
    "description": listing.description,
    "image": mainImage ? [mainImage] : undefined,
    "offers": {
      "@type": "Offer",
      "price": listing.price,
      "priceCurrency": listing.currency || "RON",
      "availability": "https://schema.org/InStock",
      "url": typeof window !== 'undefined' ? window.location.href : \`https://piata-ai.ro/anunt/\${params.slug}\`,
      "seller": {
        "@type": "Organization",
        "name": "Piata AI"
      }
    }
  };
`;

const renderHeadSnippet = `
      {/* Structured Data & OG Tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <title>{listing.title} - Piata AI</title>
      <meta name="description" content={listing.description.substring(0, 150)} />
      <meta property="og:title" content={\`\${listing.title} - Piata AI\`} />
      <meta property="og:description" content={listing.description.substring(0, 150)} />
      {mainImage && <meta property="og:image" content={mainImage} />}
      <meta property="og:type" content="product" />
`;

// Insert after state/loading handling, right before the return statement of the component
code = code.replace(/(if \(loading\) return [\s\S]*?;)(\s*)(return \()/, (match, p1, p2, p3) => {
  return p1 + '\n' + structuredDataSnippet + '\n' + p2 + p3;
});

// Insert inside the main container div (or similar root element in return)
code = code.replace(/(return \(\s*<div className="min-h-screen bg-\[#020817\] text-white">)/, (match, p1) => {
  return p1 + '\n' + renderHeadSnippet;
});

fs.writeFileSync('anunt_page_patched.tsx', code);
