"use client";

import React, { use, useState, useEffect } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useDB } from "@/context/DBContext";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import VideoModal from "@/components/VideoModal";
import { parseVideoUrl, ProductVideo } from "@/lib/videoUtils";
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Calendar, Check, ArrowLeft, MessageSquare, Percent, Eye, Star, Play, Video as VideoIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GalleryItem {
  type: "image" | "video";
  url: string;
  videoUrl?: string;
  videoTitle?: string;
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { products, categories, incrementProductViews, addReview } = useDB();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  // Video and Gallery States
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  const [activeVideoTitle, setActiveVideoTitle] = useState("");

  // 1. Increment views count only once per slug change
  useEffect(() => {
    if (slug) {
      incrementProductViews(slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // 2. Sync product state from DB products list
  useEffect(() => {
    if (slug) {
      const match = products.find((p) => p.slug === slug);
      if (match) {
        setProduct(match);
      }
    }
  }, [slug, products]);

  // 3. Set up gallery items dynamically without resetting user selection
  useEffect(() => {
    if (product) {
      const items: GalleryItem[] = product.images.map((img: string) => ({
        type: "image",
        url: img
      }));

      if (product.videos && Array.isArray(product.videos)) {
        product.videos.forEach((vid: any) => {
          if (vid.show_in_gallery) {
            const parsed = parseVideoUrl(vid.url);
            if (parsed.thumbnail) {
              items.push({
                type: "video",
                url: parsed.thumbnail,
                videoUrl: vid.url,
                videoTitle: vid.title
              });
            }
          }
        });
      }

      setGalleryItems(items);
      
      // Preserve active selection if it still exists, otherwise default to first item
      setSelectedItem((prev) => {
        if (prev && items.some((item) => item.url === prev.url)) {
          return prev;
        }
        return items[0] || null;
      });

      setSelectedImage((prev) => {
        if (prev && items.some((item) => item.url === prev)) {
          return prev;
        }
        return product.images[0] || "";
      });
    }
  }, [product]);

  // SEO: Dynamic Page Title, Description & Preconnect tags
  useEffect(() => {
    if (product) {
      const seoTitle = locale === "pt" ? product.seo_title_pt : product.seo_title_es;
      const fallbackTitle = locale === "pt" ? `${product.name_pt} | Muebles` : `${product.name_es} | Muebles`;
      document.title = seoTitle || fallbackTitle;

      const seoDesc = locale === "pt" ? product.seo_description_pt : product.seo_description_es;
      const fallbackDesc = locale === "pt" ? product.description_pt : product.description_es;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', (seoDesc || fallbackDesc || "").slice(0, 160));
    }
  }, [product, locale]);

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-96 flex flex-col items-center justify-center font-sans space-y-4">
          <p className="text-slate-500">Produto não encontrado.</p>
          <Link href="/" className="px-6 py-2 bg-slate-900 text-white rounded text-sm font-semibold">
            Voltar ao Início
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const name = locale === "pt" ? product.name_pt : product.name_es;
  const description = locale === "pt" ? product.description_pt : product.description_es;
  const material = locale === "pt" ? product.material_pt : product.material_es;
  const warranty = locale === "pt" ? product.warranty_pt : product.warranty_es;
  const deliveryTime = locale === "pt" ? product.delivery_time_pt : product.delivery_time_es;
  const categoryName = categories.find((c) => c.id === product.category_id)?.[locale === "pt" ? "name_pt" : "name_es"] || "";

  const getExtraSpecs = () => {
    const extra: { label: string; value: string }[] = [];
    
    // Direct keys check on dynamic object
    if (product.potencia) extra.push({ label: locale === "pt" ? "Potência" : "Potencia", value: String(product.potencia) });
    else if (product.potency) extra.push({ label: locale === "pt" ? "Potência" : "Potencia", value: String(product.potency) });
    
    if (product.voltagem) extra.push({ label: locale === "pt" ? "Voltagem" : "Voltaje", value: String(product.voltagem) });
    else if (product.voltage) extra.push({ label: locale === "pt" ? "Voltagem" : "Voltaje", value: String(product.voltage) });
    
    if (product.capacidade) extra.push({ label: locale === "pt" ? "Capacidade" : "Capacidad", value: String(product.capacidade) });
    else if (product.capacity) extra.push({ label: locale === "pt" ? "Capacidade" : "Capacidad", value: String(product.capacity) });
    
    // Scan text sources (description, dimensions, materials) for keywords
    const searchInText = (text: string) => {
      if (!text) return;
      
      // Voltage regex search
      if (!extra.some(e => e.label.toLowerCase().includes("volt"))) {
        const voltMatch = text.match(/(?:voltagem|voltaje|voltagens|tensão|tension):\s*([^\n.,;]+)/i) || 
                          text.match(/(\d+\s*v\b)/i);
        if (voltMatch && voltMatch[1]) {
          extra.push({ label: locale === "pt" ? "Voltagem" : "Voltaje", value: voltMatch[1].trim() });
        }
      }
      
      // Potency/Power regex search
      if (!extra.some(e => e.label.toLowerCase().includes("potên") || e.label.toLowerCase().includes("poten"))) {
        const potMatch = text.match(/(?:potência|potencia):\s*([^\n.,;]+)/i) || 
                         text.match(/(\d+\s*w\b)/i);
        if (potMatch && potMatch[1]) {
          extra.push({ label: locale === "pt" ? "Potência" : "Potencia", value: potMatch[1].trim() });
        }
      }

      // Capacity regex search
      if (!extra.some(e => e.label.toLowerCase().includes("capac"))) {
        const capMatch = text.match(/(?:capacidade|capacidad):\s*([^\n.,;]+)/i) ||
                         text.match(/(\d+\s*(?:l(?:itros)?|kg|kilos|litros))/i);
        if (capMatch && capMatch[1]) {
          extra.push({ label: locale === "pt" ? "Capacidade" : "Capacidad", value: capMatch[1].trim() });
        }
      }
    };

    searchInText(locale === "pt" ? product.description_pt : product.description_es);
    searchInText(product.dimensions);
    searchInText(locale === "pt" ? product.material_pt : product.material_es);

    return extra;
  };

  const isPromo = !!product.promo_price;
  const activePrice = product.promo_price || product.price;
  const saving = isPromo ? product.price - (product.promo_price as number) : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(val).replace("PYG", "Gs.");
  };

  // Magnifying Zoom Hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.8)"
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  const handleSelectGalleryItem = (item: GalleryItem) => {
    setSelectedItem(item);
    setSelectedImage(item.url);
  };

  const handleWatchVideo = (videoUrl?: string, videoTitle?: string) => {
    if (videoUrl) {
      setActiveVideoUrl(videoUrl);
      setActiveVideoTitle(videoTitle || "");
      setIsVideoModalOpen(true);
    } else {
      // Find main video or fall back to first video
      const mainVid = product.videos?.find((v: any) => v.is_main) || product.videos?.[0];
      if (mainVid) {
        setActiveVideoUrl(mainVid.url);
        setActiveVideoTitle(mainVid.title);
        setIsVideoModalOpen(true);
      }
    }
  };

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(
      locale === "pt"
        ? `Olá! Tenho interesse em adquirir o produto: ${name} (Quantidade: ${quantity}, Valor unitário: ${formatCurrency(activePrice)})`
        : `¡Hola! Tengo interés en adquirir el producto: ${name} (Cantidad: ${quantity}, Valor unitario: ${formatCurrency(activePrice)})`
    );
    window.open(`https://wa.me/595973953874?text=${text}`, "_blank");
  };

  // Find related products in the same category
  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      {/* Network preconnect for external video providers */}
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://player.vimeo.com" />
      <link rel="preconnect" href="https://iframe.videodelivery.net" />
      <link rel="preconnect" href="https://vumbnail.com" />

      <Header />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === "pt" ? "Voltar aos Produtos" : "Volver a Productos"}</span>
          </Link>
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{product.views_count} {locale === "pt" ? "visualizações" : "visitas"}</span>
          </span>
        </div>

        {/* Product details panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm">
          
          {/* Product Gallery Column */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Main zoomable preview */}
            <div
              className="h-96 sm:h-[500px] w-full rounded-2xl bg-slate-50 border border-slate-100 p-8 flex items-center justify-center overflow-hidden relative cursor-zoom-in group/mainimg"
              onMouseMove={selectedItem?.type === "image" ? handleMouseMove : undefined}
              onMouseLeave={selectedItem?.type === "image" ? handleMouseLeave : undefined}
            >
              <img
                src={selectedImage}
                alt={name}
                style={selectedItem?.type === "image" ? zoomStyle : {}}
                className={`max-h-full max-w-full object-contain transition-all duration-150 ease-out ${
                  selectedItem?.type === "video" ? "brightness-95 cursor-default" : ""
                }`}
                loading="lazy"
              />

              {/* Centered large play button overlay when selected gallery item is a video */}
              {selectedItem?.type === "video" && (
                <button
                  onClick={() => handleWatchVideo(selectedItem.videoUrl, selectedItem.videoTitle)}
                  className="absolute z-10 flex flex-col items-center justify-center gap-2.5 bg-slate-905/95 hover:bg-slate-950 text-white font-bold text-sm px-7 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-md cursor-pointer border border-white/20 animate-pulse"
                >
                  <Play className="w-10 h-10 fill-white text-white" />
                  <span>{locale === "pt" ? "▶ Assistir Vídeo" : "▶ Ver Video"}</span>
                </button>
              )}

              {/* Corner floating play button overlay for image item when product has videos */}
              {selectedItem?.type === "image" && product.videos && product.videos.length > 0 && (
                <button
                  onClick={() => handleWatchVideo()}
                  className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-slate-900/90 hover:bg-slate-950 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-md cursor-pointer border border-white/10"
                >
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{locale === "pt" ? "Assistir Vídeo" : "Ver Video"}</span>
                </button>
              )}
            </div>

            {/* Thumbnail Carousel Selector */}
            {galleryItems.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-1">
                {galleryItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectGalleryItem(item)}
                    className={`h-16 w-16 flex-shrink-0 rounded-lg p-1 bg-slate-50 border transition-all flex items-center justify-center relative ${
                      selectedItem?.url === item.url
                        ? "border-accent-amber ring-2 ring-accent-amber/25 bg-white scale-105"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <img src={item.url} alt={`${name}-${idx}`} className="h-full w-full object-contain" loading="lazy" />
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg transition-colors hover:bg-black/25">
                        <Play className="w-5 h-5 text-white fill-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Purchase Options Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            {/* Header tags, title and reviews */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {categoryName}
                </span>
                {product.stock > 0 ? (
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {t("product.in_stock")} ({product.stock})
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded-full">
                    {t("product.out_of_stock")}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {name}
              </h1>

              {/* Pricing breakdown */}
              <div className="pt-2 border-b border-slate-100 pb-5">
                <div className="flex items-baseline gap-2.5 font-sans">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatCurrency(activePrice)}
                  </span>
                  {isPromo && (
                    <span className="text-base text-slate-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
                {isPromo && (
                  <p className="text-xs text-emerald-500 font-semibold mt-1">
                    {t("product.saving")} {formatCurrency(saving)} (-{Math.round((saving / product.price) * 100)}%)
                  </p>
                )}
              </div>

              {/* Short description body */}
              <p className="text-sm text-slate-500 leading-relaxed pt-2">
                {description}
              </p>
            </div>

            {/* Structured Specifications Grid (Premium Card) */}
            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-100/80 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1">
                <span>📐 {locale === "pt" ? "Especificações Técnicas" : "Especificaciones Técnicas"}</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                {product.brand && (
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">{locale === "pt" ? "Marca" : "Marca"}</span>
                    <p className="text-slate-800 font-bold text-[11px]">{product.brand}</p>
                  </div>
                )}
                {product.model && (
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">{locale === "pt" ? "Modelo" : "Modelo"}</span>
                    <p className="text-slate-800 font-bold text-[11px]">{product.model}</p>
                  </div>
                )}
                {product.sku && (
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">SKU</span>
                    <p className="text-slate-800 font-mono font-bold text-[11px]">{product.sku}</p>
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">{t("product.dimensions")}</span>
                  <p className="text-slate-800 font-medium text-[11px]">{product.dimensions}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">{t("product.material")}</span>
                  <p className="text-slate-800 font-medium text-[11px] line-clamp-1" title={material}>{material}</p>
                </div>
                <div className="space-y-0.5 col-span-2">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">{locale === "pt" ? "Prazo de Entrega" : "Plazo de Entrega"}</span>
                  <p className="text-slate-800 font-medium text-[11px]">{deliveryTime}</p>
                </div>

                {/* Render extracted details for appliances dynamically */}
                {getExtraSpecs().map((spec, index) => (
                  <div key={index} className="space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">{spec.label}</span>
                    <p className="text-slate-800 font-bold text-[11px]">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity adjustments and checkout action buttons */}
            {product.stock > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">{locale === "pt" ? "Quantidade" : "Cantidad"}:</span>
                  <div className="flex items-center border border-slate-200 rounded-md bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 font-bold transition-colors animate-fade-in"
                    >
                      -
                    </button>
                    <span className="px-4 font-bold text-slate-850 font-mono text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Comprar Agora */}
                    <button
                      onClick={() => addToCart(product, quantity)}
                      className="h-13 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer border-2 border-slate-950"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{t("product.button_buy")}</span>
                    </button>

                    {/* WhatsApp Order */}
                    <button
                      onClick={handleWhatsAppOrder}
                      className="h-13 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer border-2 border-emerald-600"
                    >
                      <MessageSquare className="w-4.5 h-4.5 text-white fill-white" />
                      <span>{t("product.button_whatsapp")}</span>
                    </button>
                  </div>

                  {/* Solicitar Orçamento */}
                  <Link
                    href={`/checkout?quote=true&prod=${product.id}&qty=${quantity}`}
                    className="w-full h-13 border-2 border-dashed border-slate-350 text-slate-600 rounded-xl font-bold text-sm hover:border-slate-550 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5 bg-slate-50/50 hover:bg-slate-100"
                  >
                    <span>{t("product.button_quote")}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-sm text-center border border-slate-200 border-dashed">
                {locale === "pt"
                  ? "Este produto está temporariamente indisponível no estoque."
                  : "Este producto está temporalmente agotado."}
                <a
                  href={`https://wa.me/595973953874?text=Quero%20saber%20quando%20o%20produto%20${name}%20estara%20disponivel`}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-2 font-bold text-accent-amber hover:underline"
                >
                  Avise-me pelo WhatsApp &rarr;
                </a>
              </div>
            )}

            {/* Guarantee Policy Trust List */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 text-[10px] text-slate-400 leading-snug">
              <div className="flex gap-2">
                <Truck className="w-6 h-6 text-slate-300 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-600">Frete a Combinar</h4>
                  <p>Entrega programada para todo o Paraguai.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <RotateCcw className="w-6 h-6 text-slate-300 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-600">Trocas Simples</h4>
                  <p>Satisfação total ou devolução em 7 dias.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* YouTube Video Section */}
        {(() => {
          if (!product.video_url) return null;
          let id = "";
          const url = product.video_url;
          if (url.includes("youtu.be/")) {
            id = url.split("youtu.be/")[1]?.split("?")[0] || "";
          } else if (url.includes("youtube.com/watch")) {
            id = url.split("v=")[1]?.split("&")[0] || "";
          } else if (url.includes("youtube.com/embed/")) {
            id = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
          } else {
            id = url;
          }
          if (!id) return null;
          
          return (
            <section className="mt-16 border-t border-slate-200 pt-12 space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {locale === "pt" ? "Vídeo Demonstrativo" : "Video Demonstrativo"}
                </h2>
                <p className="text-xs text-slate-500">
                  {locale === "pt" ? "Veja a demonstração e o funcionamento prático do produto" : "Vea la demostración y el funcionamiento práctico del producto"}
                </p>
              </div>
              <div className="w-full max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden border-2 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-slate-950">
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  title={name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </section>
          );
        })()}

        {/* Customer Reviews Section */}
        <section className="mt-16 border-t border-slate-200 pt-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {locale === "pt" ? "Avaliações de Clientes" : "Opiniones de Clientes"}
              </h2>
              <p className="text-xs text-slate-500">
                {locale === "pt" ? "Opiniões reais de quem comprou e aprovou nossos produtos" : "Opiniones reales de quienes compraron y aprobaron nuestros productos"}
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {product.reviews && product.reviews.length > 0 
                  ? (product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length).toFixed(1) 
                  : "5.0"}
              </span>
              <div className="flex flex-col">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  {product.reviews ? product.reviews.length : 0} {locale === "pt" ? "avaliações" : "opiniones"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Reviews list */}
            <div className="lg:col-span-7 space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev: any, index: number) => (
                  <div key={index} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-950">{rev.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-slate-200" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-650 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-450 border border-dashed border-slate-200 rounded-xl">
                  {locale === "pt" ? "Ainda não há avaliações para este produto. Seja o primeiro!" : "Aún no hay opiniones para este producto. ¡Sé el primero!"}
                </div>
              )}
            </div>

            {/* Write a review form */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                {locale === "pt" ? "Deixe sua Avaliação" : "Deja tu Opinión"}
              </h3>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const nameVal = target.elements.reviewerName.value;
                  const ratingVal = Number(target.elements.reviewerRating.value);
                  const commentVal = target.elements.reviewerComment.value;

                  if (!nameVal || !commentVal) return;
                  
                  addReview(product.id, nameVal, ratingVal, commentVal);
                  
                  alert(locale === "pt" 
                    ? "Sua avaliação foi enviada com sucesso! Muito obrigado pelo feedback." 
                    : "¡Su valoración fue enviada con éxito! Muchas gracias por el comentario."
                  );

                  target.reset();
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase">{locale === "pt" ? "Seu Nome" : "Tu Nombre"}</label>
                  <input
                    type="text"
                    name="reviewerName"
                    required
                    placeholder="Ex: Juan Perez"
                    className="w-full px-3 py-2 border border-slate-250 rounded bg-white text-slate-950 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase">{locale === "pt" ? "Nota (1 a 5)" : "Calificación (1 a 5)"}</label>
                  <select
                    name="reviewerRating"
                    className="w-full px-3 py-2 border border-slate-250 rounded bg-white text-slate-950 font-bold"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase">{locale === "pt" ? "Comentário" : "Comentario"}</label>
                  <textarea
                    name="reviewerComment"
                    required
                    rows={3}
                    placeholder={locale === "pt" ? "Fale sobre o conforto, entrega e atendimento..." : "Habla sobre la comodidad, entrega y atención..."}
                    className="w-full px-3 py-2 border border-slate-250 rounded bg-white text-slate-950 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  {locale === "pt" ? "Enviar Avaliação" : "Enviar Opinión"}
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 space-y-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 border-b border-slate-200 pb-4">
              {t("product.related")}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((rp) => {
                const rpName = locale === "pt" ? rp.name_pt : rp.name_es;
                const rpPrice = rp.promo_price || rp.price;
                return (
                  <div
                    key={rp.id}
                    className="group bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-premium-lg transition-all"
                  >
                    <Link
                      href={`/product/${rp.slug}`}
                      className="h-44 flex items-center justify-center p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <img src={rp.images[0]} alt={rpName} className="max-h-full max-w-full object-contain" loading="lazy" />
                    </Link>
                    <div className="p-4 space-y-1.5">
                      <h3 className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-accent-amber transition-colors">
                        <Link href={`/product/${rp.slug}`}>{rpName}</Link>
                      </h3>
                      <p className="text-sm font-extrabold text-slate-900">{formatCurrency(rpPrice)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* Video Player Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={activeVideoUrl}
        videoTitle={activeVideoTitle}
      />

      {/* JSON-LD Schema.org Structured Data */}
      {(() => {
        const parsedVideos = (product.videos || [])
          .map((vid: any) => {
            const parsed = parseVideoUrl(vid.url);
            if (!parsed.provider) return null;
            return {
              "@type": "VideoObject",
              "name": vid.title || name,
              "description": description || name,
              "thumbnailUrl": parsed.thumbnail,
              "uploadDate": product.created_at || new Date().toISOString(),
              "contentUrl": vid.url,
              "embedUrl": parsed.embedUrl
            };
          })
          .filter(Boolean);

        const productSchema = {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": name,
          "image": product.images,
          "description": description,
          "sku": product.sku || product.id,
          "brand": {
            "@type": "Brand",
            "name": product.brand || "Muebles"
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "PYG",
            "price": activePrice,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          },
          ...(parsedVideos.length > 0 ? { "subjectOf": parsedVideos } : {})
        };

        return (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          />
        );
      })()}

      <Footer />
    </>
  );
}
