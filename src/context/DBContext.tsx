"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ProductVideo } from "@/lib/videoUtils";

export interface Category {
  id: string;
  slug: string;
  name_pt: string;
  name_es: string;
  icon: string;
}

export interface ProductReview {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  slug: string;
  name_pt: string;
  name_es: string;
  description_pt: string;
  description_es: string;
  price: number;
  promo_price?: number;
  category_id: string;
  images: string[]; // SVGs or URLs
  stock: number;
  min_stock: number;
  dimensions: string;
  material_pt: string;
  material_es: string;
  warranty_pt: string;
  warranty_es: string;
  delivery_time_pt: string;
  delivery_time_es: string;
  seo_title_pt?: string;
  seo_title_es?: string;
  seo_description_pt?: string;
  seo_description_es?: string;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  reviews?: ProductReview[];
  brand?: string;
  model?: string;
  sku?: string;
  video_url?: string;
  videos?: ProductVideo[];
  badges?: string[];
  countdown_end?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_purchase?: number;
  active: boolean;
  expires_at?: string;
  usage_count: number;
  max_uses?: number;
}

export interface Promotion {
  id: string;
  type: "hero" | "primary_banner" | "secondary_banner" | "offer_week";
  title_pt: string;
  title_es: string;
  subtitle_pt?: string;
  subtitle_es?: string;
  image_url: string;
  link_url: string;
  active: boolean;
}

export interface OrderItem {
  product_id: string;
  name_pt: string;
  name_es: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  city: string;
  address: string;
  notes?: string;
  status: "Novo" | "Confirmado" | "Separando" | "Em Transporte" | "Entregue" | "Cancelado";
  total_amount: number;
  payment_method: string;
  items: OrderItem[];
  created_at: string;
  coupon_code?: string;
  discount_amount?: number;
}

interface DBContextType {
  categories: Category[];
  products: Product[];
  orders: Order[];
  promotions: Promotion[];
  coupons: Coupon[];
  addProduct: (product: Omit<Product, "id" | "views_count" | "created_at">) => void;
  editProduct: (id: string, updatedProduct: Partial<Product>) => void;
  duplicateProduct: (id: string) => void;
  deleteProduct: (id: string) => void;
  incrementProductViews: (slug: string) => void;
  updateStock: (id: string, newStock: number, minStock?: number) => void;
  createOrder: (order: Omit<Order, "id" | "order_number" | "created_at">) => Order;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updatePromotion: (id: string, updatedPromo: Partial<Promotion>) => void;
  addReview: (productId: string, name: string, rating: number, comment: string) => void;
  addCoupon: (coupon: Omit<Coupon, "id" | "usage_count">) => void;
  editCoupon: (id: string, updatedCoupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  useCoupon: (code: string) => Coupon | null;
}

const DBContext = createContext<DBContextType | undefined>(undefined);

// Initial Categories Seed
const initialCategories: Category[] = [
  { id: "cat-1", slug: "office-chairs", name_pt: "Cadeiras de Escritório", name_es: "Sillas de Oficina", icon: "Armchair" },
  { id: "cat-2", slug: "gamer-chairs", name_pt: "Cadeiras Gamer", name_es: "Sillas Gamer", icon: "Gamepad2" },
  { id: "cat-3", slug: "desks", name_pt: "Mesas", name_es: "Mesas", icon: "Table" },
  { id: "cat-4", slug: "home-office", name_pt: "Home Office", name_es: "Home Office", icon: "Laptop" },
  { id: "cat-5", slug: "bookshelves", name_pt: "Estantes", name_es: "Estanterías", icon: "BookOpen" },
  { id: "cat-6", slug: "appliances", name_pt: "Eletrodomésticos", name_es: "Electrodomésticos", icon: "Tv" }
];

// SVG Drawings representing each item to avoid generic broken images
const placeholderSVGChairs = (color: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="${encodeURIComponent(color)}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9H3z"/><path d="M5 15v5"/><path d="M19 15v5"/><path d="M12 15v3"/><path d="m8 18 8 0"/></svg>`;
const placeholderSVGDesk = (color: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="${encodeURIComponent(color)}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="18" height="4" rx="1"/><path d="M5 14v6"/><path d="M19 14v6"/><path d="M9 14v4"/><path d="M15 14v4"/></svg>`;
const placeholderSVGBookshelf = (color: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="${encodeURIComponent(color)}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>`;
const placeholderSVGAppliance = (color: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="${encodeURIComponent(color)}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/><path d="M5 10h14"/><path d="M9 5h6"/></svg>`;

const initialProducts: Product[] = [
  {
    id: "prod-1",
    slug: "cadeira-ergonomica-executive-pro",
    name_pt: "Cadeira Ergonomica Executive Pro",
    name_es: "Silla Ergonómica Executive Pro",
    description_pt: "Cadeira de escritório de altíssimo padrão com suporte lombar dinâmico, braços 3D e malha respirável Mesh de alta resistência. Ideal para quem passa mais de 8 horas sentado.",
    description_es: "Silla de oficina de alto estándar con soporte lumbar dinámico, reposabrazos 3D y malla transpirable de alta resistencia. Ideal para personas que pasan más de 8 horas sentadas.",
    price: 1850000,
    promo_price: 1590000,
    category_id: "cat-1",
    images: [placeholderSVGChairs("#0F172A"), placeholderSVGChairs("#334155")],
    stock: 24,
    min_stock: 5,
    dimensions: "65cm x 65cm x 120-130cm",
    material_pt: "Malha Mesh Premium, Estrutura em Aço Inox, Rodas Anti-risco",
    material_es: "Malla Mesh Premium, Estructura de Acero Inox, Ruedas Antirrayas",
    warranty_pt: "3 anos de garantia estrutural",
    warranty_es: "3 años de garantía estructural",
    delivery_time_pt: "2 a 4 dias úteis",
    delivery_time_es: "2 a 4 días hábiles",
    seo_title_pt: "Cadeira Ergonomica Executive Pro - E-commerce Premium",
    seo_title_es: "Silla Ergonómica Executive Pro - E-commerce Premium",
    seo_description_pt: "Compre a Cadeira Ergonomica Executive Pro no Paraguai. Ergonômica, moderna, em aço inox e frete rápido.",
    seo_description_es: "Compre la Silla Ergonómica Executive Pro en Paraguay. Ergonómica, moderna, en acero inoxidable y envío rápido.",
    is_featured: true,
    views_count: 342,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reviews: [
      { name: "Juan Manuel Benítez", rating: 5, comment: "Excelente cadeira! O suporte lombar faz toda a diferença para o dia a dia.", date: "15/06/2026" },
      { name: "Carlos Cáceres", rating: 5, comment: "Produto de altíssima qualidade, muito robusto e confortável. Recomendo a compra.", date: "20/06/2026" }
    ]
  },
  {
    id: "prod-2",
    slug: "cadeira-gamer-ares-rgb-carbon",
    name_pt: "Cadeira Gamer Ares RGB Carbon",
    name_es: "Silla Gamer Ares RGB Carbon",
    description_pt: "Desenvolvida para o máximo desempenho gamer. Espuma injetada de densidade 50, tecido simulando fibra de carbono e iluminação RGB integrada nas laterais com controle remoto.",
    description_es: "Desarrollada para el máximo rendimiento gamer. Espuma inyectada de densidad 50, tela símil fibra de carbono e iluminación RGB integrada en los laterales con control remoto.",
    price: 2200000,
    promo_price: 1890000,
    category_id: "cat-2",
    images: [placeholderSVGChairs("#F59E0B"), placeholderSVGChairs("#0F172A")],
    stock: 12,
    min_stock: 4,
    dimensions: "70cm x 68cm x 130-140cm",
    material_pt: "Couro PU Carbon, Espuma Densidade 50, Pistão Classe 4",
    material_es: "Cuero PU Carbon, Espuma Densidad 50, Pistón Clase 4",
    warranty_pt: "1 ano de garantia",
    warranty_es: "1 año de garantía",
    delivery_time_pt: "3 a 5 dias úteis",
    delivery_time_es: "3 a 5 días hábiles",
    is_featured: true,
    views_count: 512,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-3",
    slug: "mesa-diretiva-minimalista-wood-steel",
    name_pt: "Mesa Diretiva Minimalista Wood & Steel",
    name_es: "Mesa Directiva Minimalista Wood & Steel",
    description_pt: "Design industrial sofisticado. Tampo de madeira maciça de reflorestamento com tratamento impermeabilizante e pés estruturais de aço com pintura eletrostática preta.",
    description_es: "Diseño industrial sofisticado. Tapa de madera maciza de reforestación con tratamiento impermeabilizante y patas de acero estructural con pintura electrostática negra.",
    price: 3400000,
    promo_price: 2990000,
    category_id: "cat-3",
    images: [placeholderSVGDesk("#78350F"), placeholderSVGDesk("#1E293B")],
    stock: 8,
    min_stock: 3,
    dimensions: "160cm x 80cm x 75cm",
    material_pt: "Madeira Maciça de Pinus Taeda, Aço Carbono Carbonizado",
    material_es: "Madera Maciza de Pino Taeda, Acero de Carbono Pintado",
    warranty_pt: "2 anos de garantia",
    warranty_es: "2 años de garantía",
    delivery_time_pt: "5 a 10 dias úteis",
    delivery_time_es: "5 a 10 días hábiles",
    is_featured: true,
    views_count: 228,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-4",
    slug: "estante-organizadora-modular-grid",
    name_pt: "Estante Organizadora Modular Grid",
    name_es: "Estantería Organizadora Modular Grid",
    description_pt: "Estante clean estilo industrial, ideal para acomodar livros, plantas e decorações. Estrutura modular que permite expandir lateralmente.",
    description_es: "Estantería limpia de estilo industrial, ideal para albergar libros, plantas y decoración. Estructura modular que permite la expansión lateral.",
    price: 1200000,
    promo_price: 990000,
    category_id: "cat-5",
    images: [placeholderSVGBookshelf("#1E293B")],
    stock: 3, // Lower than min_stock to trigger dashboard alert!
    min_stock: 5,
    dimensions: "80cm x 35cm x 180cm",
    material_pt: "Aço Carbono e MDF Texturizado Amadeirado",
    material_es: "Acero de Carbono y MDF Texturizado Amaderado",
    warranty_pt: "1 ano de garantia",
    warranty_es: "1 año de garantía",
    delivery_time_pt: "4 a 6 dias úteis",
    delivery_time_es: "4 a 6 días hábiles",
    is_featured: false,
    views_count: 145,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-5",
    slug: "escrivaninha-compacta-slim-office",
    name_pt: "Escrivaninha Compacta Slim Home Office",
    name_es: "Escritorio Compacto Slim Home Office",
    description_pt: "Perfeita para home office em espaços reduzidos. Gaveta embutida com corrediças telescópicas e nicho organizador traseiro para passagem de cabos.",
    description_es: "Perfecto para el home office en espacios pequeños. Cajón integrado con guías telescópicas y nicho organizador trasero para pasacables.",
    price: 950000,
    promo_price: 790000,
    category_id: "cat-4",
    images: [placeholderSVGDesk("#475569")],
    stock: 15,
    min_stock: 4,
    dimensions: "100cm x 50cm x 75cm",
    material_pt: "MDF 18mm com Pintura UV Anti-risco, Pés de Madeira Maciça",
    material_es: "MDF 18mm con Pintura UV Antirrayas, Patas de Madera Maciza",
    warranty_pt: "1 ano de garantia",
    warranty_es: "1 año de garantía",
    delivery_time_pt: "2 a 5 dias úteis",
    delivery_time_es: "2 a 5 días hábiles",
    is_featured: false,
    views_count: 198,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-6",
    slug: "cadeira-ergonomica-task-fit-light",
    name_pt: "Cadeira Ergonomica Task Fit Light",
    name_es: "Silla Ergonómica Task Fit Light",
    description_pt: "Opção leve e super ergonômica para home office diário. Suporte lombar fixo ajustado perfeitamente para postura correta e base giratória em nylon reforçado.",
    description_es: "Opción ligera y súper ergonómica para el home office diario. Soporte lumbar fijo ajustado perfectamente para la postura correcta y base giratoria en nylon reforzado.",
    price: 980000,
    promo_price: 850000,
    category_id: "cat-1",
    images: [placeholderSVGChairs("#475569")],
    stock: 19,
    min_stock: 6,
    dimensions: "60cm x 60cm x 95-105cm",
    material_pt: "Nylon Injetado, Tecido Poliéster Aerado Mesh",
    material_es: "Nylon Inyectado, Tela Poliéster Aireada Mesh",
    warranty_pt: "1 ano de garantia",
    warranty_es: "1 año de garantía",
    delivery_time_pt: "2 a 3 dias úteis",
    delivery_time_es: "2 a 3 días hábiles",
    is_featured: true,
    views_count: 289,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-7",
    slug: "mesa-regulavel-smart-elevatoria",
    name_pt: "Mesa Regulavel Smart Elevatória",
    name_es: "Mesa Regulable Smart Elevatoria",
    description_pt: "Mesa digital elevatória motorizada. Ajuste de altura por painel digital programável com 3 memórias. Ideal para alternar entre trabalhar em pé ou sentado.",
    description_es: "Mesa digital elevadora motorizada. Ajuste de altura por panel digital programable con 3 memorias. Ideal para alternar entre trabajar parado o sentado.",
    price: 4900000,
    promo_price: 4200000,
    category_id: "cat-3",
    images: [placeholderSVGDesk("#0F172A"), placeholderSVGDesk("#F8FAFC")],
    stock: 5,
    min_stock: 2,
    dimensions: "140cm x 70cm x 65-125cm",
    material_pt: "Tampo MDF Premium, Pernas Telescópicas de Metal, Motor Duplo",
    material_es: "Tapa de MDF Premium, Patas Telescópicas de Metal, Motor Doble",
    warranty_pt: "3 anos de garantia no motor e eletrônica",
    warranty_es: "3 años de garantía en el motor y la electrónica",
    delivery_time_pt: "5 a 12 dias úteis",
    delivery_time_es: "5 a 12 días hábiles",
    is_featured: true,
    views_count: 489,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-app-1",
    slug: "smart-tv-55-qled-samsung-4k",
    name_pt: "Smart TV 55\" QLED Samsung 4K",
    name_es: "Smart TV 55\" QLED Samsung 4K",
    description_pt: "Experiência de cinema em casa com tela QLED 4K, HDR10+, Smart Hub e controle por voz integrado. Design slim premium que se integra perfeitamente ao seu espaço.",
    description_es: "Experiencia de cine en casa con pantalla QLED 4K, HDR10+, Smart Hub y control de voz integrado. Diseño slim premium que se integra perfectamente a tu espacio.",
    price: 4800000,
    promo_price: 3990000,
    category_id: "cat-6",
    images: [placeholderSVGAppliance("#0F172A"), placeholderSVGAppliance("#2563EB")],
    stock: 15,
    min_stock: 3,
    dimensions: "123cm x 70.8cm x 2.5cm",
    material_pt: "Metal e Polímeros de Alta Qualidade",
    material_es: "Metal y Polímeros de Alta Calidad",
    warranty_pt: "1 ano de garantia Samsung",
    warranty_es: "1 año de garantía Samsung",
    delivery_time_pt: "1 a 3 dias úteis",
    delivery_time_es: "1 a 3 días hábiles",
    brand: "Samsung",
    model: "QN55Q60DAG",
    sku: "SAM-QLED55",
    badges: ["promo", "featured", "free_shipping"],
    countdown_end: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    seo_title_pt: "Smart TV 55 QLED Samsung 4K - Promoção Eletrodomésticos",
    seo_title_es: "Smart TV 55 QLED Samsung 4K - Promoción Electrodomésticos",
    seo_description_pt: "Compre Smart TV 55 QLED Samsung no Paraguai com Frete Grátis. Imagem 4K impressionante e garantia oficial.",
    seo_description_es: "Compre Smart TV 55 QLED Samsung en Paraguay con Envío Gratis. Imagen 4K impresionante y garantía oficial.",
    is_featured: true,
    views_count: 852,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-app-2",
    slug: "fritadeira-eletrica-airfryer-philips-walita-digital",
    name_pt: "Fritadeira Elétrica Airfryer Philips Walita Digital XL",
    name_es: "Fritadora Eléctrica Airfryer Philips Walita Digital XL",
    description_pt: "Prepare refeições saudáveis e saborosas com até 90% menos gordura. Painel digital touch com 7 funções pré-programadas e capacidade XL de 4.7L.",
    description_es: "Prepara comidas saludables y sabrosas con hasta un 90% menos de grasa. Panel digital touch con 7 funciones preprogramadas y capacidad XL de 4.7L.",
    price: 1250000,
    promo_price: 890000,
    category_id: "cat-6",
    images: [placeholderSVGAppliance("#DC2626"), placeholderSVGAppliance("#1E293B")],
    stock: 2,
    min_stock: 4,
    dimensions: "30.9cm x 30.7cm x 38.9cm",
    material_pt: "Plástico Termoresistente e Aço Inox",
    material_es: "Plástico Termoresistente y Acero Inoxidable",
    warranty_pt: "2 anos de garantia oficial Philips",
    warranty_es: "2 años de garantía oficial Philips",
    delivery_time_pt: "2 a 4 dias úteis",
    delivery_time_es: "2 a 4 días hábiles",
    brand: "Philips",
    model: "RI9270/90",
    sku: "PHI-AIRWAL-XL",
    badges: ["promo", "bestseller"],
    seo_title_pt: "Airfryer Philips Walita Digital XL - Preço Baixo",
    seo_title_es: "Airfryer Philips Walita Digital XL - Precio Bajo",
    seo_description_pt: "Fritadeira sem óleo Philips Walita XL no Paraguai. Compre em até 10x com preço promocional.",
    seo_description_es: "Fritadora sin aceite Philips Walita XL en Paraguay. Compre con precio promocional y garantía.",
    is_featured: true,
    views_count: 654,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-app-3",
    slug: "ar-condicionado-split-12000-btu-tokyo-inverter",
    name_pt: "Ar Condicionado Split 12000 BTU Tokyo Eco Inverter",
    name_es: "Aire Acondicionado Split 12000 BTU Tokyo Eco Inverter",
    description_pt: "Alta eficiência energética e conforto térmico o ano todo. Tecnologia Eco Inverter silenciosa que economiza até 60% de energia elétrica com gás ecológico R32.",
    description_es: "Alta eficiencia energética y confort térmico todo el año. Tecnología Eco Inverter silenciosa que ahorra hasta un 60% de energía eléctrica con gas ecológico R32.",
    price: 2850000,
    promo_price: 2390000,
    category_id: "cat-6",
    images: [placeholderSVGAppliance("#38BDF8"), placeholderSVGAppliance("#E2E8F0")],
    stock: 9,
    min_stock: 3,
    dimensions: "80.5cm x 28.5cm x 19.4cm",
    material_pt: "Chapas de Aço Galvanizado e Cobre",
    material_es: "Chapas de Acero Galvanizado y Cobre",
    warranty_pt: "3 anos de garantia no compressor",
    warranty_es: "3 años de garantía en el compresor",
    delivery_time_pt: "2 a 5 dias úteis",
    delivery_time_es: "2 a 5 días hábiles",
    brand: "Tokyo",
    model: "TK-ECO-12INVT",
    sku: "TOK-12ECOINVT",
    badges: ["new", "free_shipping"],
    seo_title_pt: "Ar Condicionado Split 12000 BTU Tokyo Inverter",
    seo_title_es: "Aire Acondicionado Split 12000 BTU Tokyo Inverter",
    seo_description_pt: "Economize energia com o Split Tokyo Inverter 12000 BTU no Paraguai. Entrega rápida e melhor preço.",
    seo_description_es: "Ahorre energía con el Split Tokyo Inverter 12000 BTU en Paraguay. Entrega rápida y mejor preço.",
    is_featured: false,
    views_count: 320,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialPromotions: Promotion[] = [
  {
    id: "promo-1",
    type: "hero",
    title_pt: "Seu novo móvel sem complicação.",
    title_es: "Tu nuevo mueble sin complicaciones.",
    subtitle_pt: "Móveis e cadeiras para casa e escritório com uma experiência de compra simples e transparente.",
    subtitle_es: "Muebles y sillas para el hogar y la oficina con una experiencia de compra simple y transparente.",
    image_url: "/hero-furniture.jpg",
    link_url: "#produtos",
    active: true
  },
  {
    id: "promo-2",
    type: "primary_banner",
    title_pt: "Linha Corporativa Ergonomica",
    title_es: "Línea Corporativa Ergonómica",
    subtitle_pt: "Até 25% OFF em cadeiras com certificação de postura",
    subtitle_es: "Hasta 25% OFF en sillas con certificación de postura",
    image_url: "/banner-office.jpg",
    link_url: "/category/office-chairs",
    active: true
  },
  {
    id: "promo-3",
    type: "secondary_banner",
    title_pt: "Montagem Grátis Assunção",
    title_es: "Montaje Gratis Asunción",
    subtitle_pt: "Para compras acima de 2.000.000 Gs.",
    subtitle_es: "Para compras superiores a 2.000.000 Gs.",
    image_url: "/banner-delivery.jpg",
    link_url: "#como-funciona",
    active: true
  }
];

const initialOrders: Order[] = [
  {
    id: "order-1",
    order_number: 1024,
    customer_name: "Juan Manuel Benítez",
    customer_phone: "+595 981 123456",
    customer_email: "juan.benitez@gmail.com",
    city: "Asunción",
    address: "Av. Mariscal López 3421, Barrio Recoleta",
    notes: "Entregar em horário comercial, de preferência à tarde.",
    status: "Confirmado",
    total_amount: 1590000,
    payment_method: "WhatsApp / Manual",
    items: [
      {
        product_id: "prod-1",
        name_pt: "Cadeira Ergonomica Executive Pro",
        name_es: "Silla Ergonómica Executive Pro",
        qty: 1,
        price: 1590000
      }
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "order-2",
    order_number: 1025,
    customer_name: "Mariana Rojas",
    customer_phone: "+595 971 789012",
    customer_email: "mariana.rojas@hotmail.com",
    city: "Ciudad del Este",
    address: "Calle Los Lapachos esq. Yvyra Pytã",
    status: "Novo",
    total_amount: 2680000,
    payment_method: "WhatsApp / Manual",
    items: [
      {
        product_id: "prod-5",
        name_pt: "Escrivaninha Compacta Slim Home Office",
        name_es: "Escritorio Compacto Slim Home Office",
        qty: 1,
        price: 790000
      },
      {
        product_id: "prod-2",
        name_pt: "Cadeira Gamer Ares RGB Carbon",
        name_es: "Silla Gamer Ares RGB Carbon",
        qty: 1,
        price: 1890000
      }
    ],
    created_at: new Date().toISOString()
  }
];

export const DBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    // Load from local storage or set seeds
    const savedProducts = localStorage.getItem("muebles_products");
    const savedOrders = localStorage.getItem("muebles_orders");
    const savedPromotions = localStorage.getItem("muebles_promotions");
    const savedCoupons = localStorage.getItem("muebles_coupons");

    if (savedProducts && JSON.parse(savedProducts).length > 0) {
      const parsed = JSON.parse(savedProducts);
      let migrated = false;
      const updatedProducts = parsed.map((p: Product) => {
        if (!p.videos) {
          p.videos = [];
          migrated = true;
          if (p.id === "prod-1") {
            p.videos = [
              {
                id: "vid-1-1",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                title: "Demonstração Cadeira Executive Pro",
                is_main: true,
                show_in_gallery: true
              },
              {
                id: "vid-1-2",
                url: "https://vimeo.com/76979871",
                title: "Ergonomia no Trabalho - Guia Rápido",
                is_main: false,
                show_in_gallery: true
              }
            ];
          } else if (p.id === "prod-3") {
            p.videos = [
              {
                id: "vid-3-1",
                url: "https://iframe.videodelivery.net/fcb4e3f1e967a50bd82cd6b9bf2294e1",
                title: "Apresentação Mesa Wood & Steel",
                is_main: true,
                show_in_gallery: true
              }
            ];
          }
        }
        return p;
      });

      if (migrated) {
        setTimeout(() => {
          setProducts(updatedProducts);
        }, 0);
        localStorage.setItem("muebles_products", JSON.stringify(updatedProducts));
      } else {
        setTimeout(() => {
          setProducts(parsed);
        }, 0);
      }
    } else {
      const seeded = initialProducts.map((p) => {
        if (p.id === "prod-1") {
          return {
            ...p,
            videos: [
              {
                id: "vid-1-1",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                title: "Demonstração Cadeira Executive Pro",
                is_main: true,
                show_in_gallery: true
              },
              {
                id: "vid-1-2",
                url: "https://vimeo.com/76979871",
                title: "Ergonomia no Trabalho - Guia Rápido",
                is_main: false,
                show_in_gallery: true
              }
            ]
          };
        } else if (p.id === "prod-3") {
          return {
            ...p,
            videos: [
              {
                id: "vid-3-1",
                url: "https://iframe.videodelivery.net/fcb4e3f1e967a50bd82cd6b9bf2294e1",
                title: "Apresentação Mesa Wood & Steel",
                is_main: true,
                show_in_gallery: true
              }
            ]
          };
        }
        return { ...p, videos: [] };
      });
      setTimeout(() => {
        setProducts(seeded);
      }, 0);
      localStorage.setItem("muebles_products", JSON.stringify(seeded));
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders(initialOrders);
      localStorage.setItem("muebles_orders", JSON.stringify(initialOrders));
    }

    if (savedPromotions) {
      setPromotions(JSON.parse(savedPromotions));
    } else {
      setPromotions(initialPromotions);
      localStorage.setItem("muebles_promotions", JSON.stringify(initialPromotions));
    }

    if (savedCoupons) {
      setCoupons(JSON.parse(savedCoupons));
    } else {
      const initialCoupons: Coupon[] = [
        { id: "c-1", code: "MUEBLES10", type: "percentage", value: 10, min_purchase: 0, active: true, usage_count: 5 },
        { id: "c-2", code: "ALTO50", type: "fixed", value: 50000, min_purchase: 500000, active: true, usage_count: 2 },
        { id: "c-3", code: "FRETEGRATIS", type: "percentage", value: 0, min_purchase: 0, active: true, usage_count: 12 }
      ];
      setCoupons(initialCoupons);
      localStorage.setItem("muebles_coupons", JSON.stringify(initialCoupons));
    }
  }, []);

  const addProduct = (p: Omit<Product, "id" | "views_count" | "created_at">) => {
    setProducts((prev) => {
      const newProduct: Product = {
        ...p,
        id: "prod-" + Date.now(),
        views_count: 0,
        created_at: new Date().toISOString()
      };
      const updated = [newProduct, ...prev];
      localStorage.setItem("muebles_products", JSON.stringify(updated));
      return updated;
    });
  };

  const editProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updatedFields };
        }
        return p;
      });
      localStorage.setItem("muebles_products", JSON.stringify(updated));
      return updated;
    });
  };

  const duplicateProduct = (id: string) => {
    setProducts((prev) => {
      const original = prev.find((p) => p.id === id);
      if (!original) return prev;
      const duplicated: Product = {
        ...original,
        id: "prod-" + Date.now(),
        slug: `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`,
        name_pt: `${original.name_pt} (Cópia)`,
        name_es: `${original.name_es} (Copia)`,
        views_count: 0,
        created_at: new Date().toISOString()
      };
      const updated = [duplicated, ...prev];
      localStorage.setItem("muebles_products", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem("muebles_products", JSON.stringify(updated));
      return updated;
    });
  };

  const incrementProductViews = (slug: string) => {
    setProducts((prev) => {
      if (prev.length === 0) return prev;
      const updated = prev.map((p) => {
        if (p.slug === slug) {
          return { ...p, views_count: p.views_count + 1 };
        }
        return p;
      });
      localStorage.setItem("muebles_products", JSON.stringify(updated));
      return updated;
    });
  };

  const updateStock = (id: string, newStock: number, minStock?: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            stock: newStock,
            min_stock: minStock !== undefined ? minStock : p.min_stock
          };
        }
        return p;
      });
      localStorage.setItem("muebles_products", JSON.stringify(updated));
      return updated;
    });
  };

  const createOrder = (orderFields: Omit<Order, "id" | "order_number" | "created_at">) => {
    const nextNumber = orders.length > 0 ? Math.max(...orders.map((o) => o.order_number)) + 1 : 1000;
    const newOrder: Order = {
      ...orderFields,
      id: "ord-" + Date.now(),
      order_number: nextNumber,
      created_at: new Date().toISOString()
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem("muebles_orders", JSON.stringify(updated));

    // Deduct stock for items ordered
    const productsUpdated = products.map((p) => {
      const orderItem = newOrder.items.find((item) => item.product_id === p.id);
      if (orderItem) {
        return { ...p, stock: Math.max(0, p.stock - orderItem.qty) };
      }
      return p;
    });
    setProducts(productsUpdated);
    localStorage.setItem("muebles_products", JSON.stringify(productsUpdated));

    // If order used coupon, increment usage count of that coupon
    if (newOrder.coupon_code) {
      useCoupon(newOrder.coupon_code);
    }

    return newOrder;
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    const updated = orders.map((o) => {
      if (o.id === id) {
        return { ...o, status };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem("muebles_orders", JSON.stringify(updated));
  };

  const updatePromotion = (id: string, updatedPromo: Partial<Promotion>) => {
    const updated = promotions.map((pr) => {
      if (pr.id === id) {
        return { ...pr, ...updatedPromo };
      }
      return pr;
    });
    setPromotions(updated);
    localStorage.setItem("muebles_promotions", JSON.stringify(updated));
  };

  const addReview = (productId: string, name: string, rating: number, comment: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const currentReviews = p.reviews || [];
          const newReview: ProductReview = {
            name,
            rating,
            comment,
            date: new Date().toLocaleDateString("pt-BR")
          };
          return {
            ...p,
            reviews: [...currentReviews, newReview]
          };
        }
        return p;
      });
      localStorage.setItem("muebles_products", JSON.stringify(updated));
      return updated;
    });
  };

  const addCoupon = (c: Omit<Coupon, "id" | "usage_count">) => {
    const newCoupon: Coupon = {
      ...c,
      id: "coup-" + Date.now(),
      usage_count: 0
    };
    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    localStorage.setItem("muebles_coupons", JSON.stringify(updated));
  };

  const editCoupon = (id: string, updatedFields: Partial<Coupon>) => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
    setCoupons(updated);
    localStorage.setItem("muebles_coupons", JSON.stringify(updated));
  };

  const deleteCoupon = (id: string) => {
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    localStorage.setItem("muebles_coupons", JSON.stringify(updated));
  };

  const useCoupon = (code: string): Coupon | null => {
    const idx = coupons.findIndex((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
    if (idx === -1) return null;
    const c = coupons[idx];
    if (c.expires_at && new Date(c.expires_at) < new Date()) return null;
    if (c.max_uses && c.usage_count >= c.max_uses) return null;

    const updated = [...coupons];
    updated[idx] = { ...c, usage_count: c.usage_count + 1 };
    setCoupons(updated);
    localStorage.setItem("muebles_coupons", JSON.stringify(updated));
    return updated[idx];
  };

  return (
    <DBContext.Provider
      value={{
        categories,
        products,
        orders,
        promotions,
        coupons,
        addProduct,
        editProduct,
        duplicateProduct,
        deleteProduct,
        incrementProductViews,
        updateStock,
        createOrder,
        updateOrderStatus,
        updatePromotion,
        addReview,
        addCoupon,
        editCoupon,
        deleteCoupon,
        useCoupon
      }}
    >
      {children}
    </DBContext.Provider>
  );
};

export const useDB = () => {
  const context = useContext(DBContext);
  if (!context) {
    throw new Error("useDB must be used within a DBProvider");
  }
  return context;
};
