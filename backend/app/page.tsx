export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>📦 Store Management API</h1>
      <p>API backend pour le système de gestion de stock</p>
      <h2>Endpoints disponibles :</h2>
      <ul>
        <li><code>GET /api/products</code> - Liste des produits</li>
        <li><code>POST /api/products</code> - Créer un produit</li>
        <li><code>GET /api/products/[id]</code> - Détails d'un produit</li>
        <li><code>GET /api/products/[id]/profit</code> - Bénéfice/perte d'un produit</li>
        <li><code>GET /api/purchases</code> - Liste des achats</li>
        <li><code>POST /api/purchases</code> - Créer un achat</li>
        <li><code>GET /api/sales</code> - Liste des ventes</li>
        <li><code>POST /api/sales</code> - Créer une vente</li>
        <li><code>GET /api/exchange-rates</code> - Liste des taux de change</li>
        <li><code>POST /api/exchange-rates</code> - Créer un taux de change</li>
      </ul>
    </div>
  )
}

