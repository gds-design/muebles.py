import ProductPageClient from "./ProductPageClient";

export function generateStaticParams() {
  return [
    { slug: "cadeira-ergonomica-executive-pro" },
    { slug: "cadeira-gamer-ares-rgb-carbon" },
    { slug: "mesa-diretiva-minimalista-wood-steel" },
    { slug: "estante-organizadora-modular-grid" },
    { slug: "escrivaninha-compacta-slim-office" },
    { slug: "cadeira-ergonomica-task-fit-light" },
    { slug: "mesa-regulavel-smart-elevatoria" },
    { slug: "smart-tv-55-qled-samsung-4k" },
    { slug: "fritadeira-eletrica-airfryer-philips-walita-digital" },
    { slug: "ar-condicionado-split-12000-btu-tokyo-inverter" },
  ];
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
