export const metadata = {
  title: 'Store Management API',
  description: 'API pour le système de gestion de stock',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}

