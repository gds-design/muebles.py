"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDB } from "@/context/DBContext";
import { useTranslation } from "@/context/LanguageContext";
import { Download, Sparkles, Image, Calendar, PlayCircle, Heart, FileText, Send, Share2, Ticket, Trash2, Plus, Check, Percent, AlertCircle } from "lucide-react";

const BENEFITS_MAP: Record<string, { pt: string; es: string }> = {
  "Design moderno": { pt: "Design moderno", es: "Diseño moderno" },
  "Alta durabilidade": { pt: "Alta durabilidade", es: "Alta durabilidad" },
  "Fácil montagem": { pt: "Fácil montagem", es: "Fácil armado" },
  "Estrutura reforçada": { pt: "Estrutura reforçada", es: "Estructura reforzada" },
  "Acabamento premium": { pt: "Acabamento premium", es: "Acabado premium" },
  "Frete Grátis": { pt: "Frete Grátis", es: "Envío gratis" },
  "Garantia estendida": { pt: "Garantia estendida", es: "Garantía extendida" },
  "Pronta entrega": { pt: "Pronta entrega", es: "Entrega inmediata" }
};

const getCtaLabel = (text: string, lang: "pt" | "es") => {
  const map: Record<string, { pt: string; es: string }> = {
    "Comprar Agora": { pt: "Comprar Agora", es: "Comprar Ahora" },
    "Comprar Ahora": { pt: "Comprar Agora", es: "Comprar Ahora" },
    "Saiba Mais": { pt: "Saiba Mais", es: "Saber Más" },
    "Saber Más": { pt: "Saiba Mais", es: "Saber Más" },
    "Ver Oferta": { pt: "Ver Oferta", es: "Ver Oferta" },
    "Pedir no WhatsApp": { pt: "Pedir no WhatsApp", es: "Pedir por WhatsApp" },
    "Pedir por WhatsApp": { pt: "Pedir no WhatsApp", es: "Pedir por WhatsApp" },
    "Garanta o Seu": { pt: "Garanta o Seu", es: "Llevá el Tuyo" },
    "Llevá el Tuyo": { pt: "Garanta o Seu", es: "Llevá el Tuyo" }
  };
  return map[text] ? (lang === "pt" ? map[text].pt : map[text].es) : text;
};

export default function MarketingCenter() {
  const { products, coupons, addCoupon, editCoupon, deleteCoupon, orders, promotions, updatePromotion } = useDB();
  const { locale } = useTranslation();

  const [activeTab, setActiveTab] = useState<"canvas" | "ai" | "schedule" | "coupons" | "banners">("canvas");
  const [artLanguage, setArtLanguage] = useState<"pt" | "es">("pt");

  // Sync art language on mount/locale changes
  useEffect(() => {
    if (locale === "es") {
      setArtLanguage("es");
    } else {
      setArtLanguage("pt");
    }
  }, [locale]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [copyLanguage, setCopyLanguage] = useState<"pt" | "es">("pt");
  const [templateType, setTemplateType] = useState<"promo" | "flash" | "launch" | "destaque">("promo");
  
  // New dimension & layout states
  const [canvasFormat, setCanvasFormat] = useState<"feed" | "feed_vertical" | "story" | "whatsapp" | "pinterest">("feed");
  const [customTitle, setCustomTitle] = useState("");
  
  // Custom Controls
  const [colorPreset, setColorPreset] = useState<"slate" | "scandinavian" | "minimalist" | "gold" | "industrial" | "clean">("slate");
  const [bgColor, setBgColor] = useState("#0F172A");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [accentColor, setAccentColor] = useState("#F59E0B");
  const [bgType, setBgType] = useState<"solid" | "gradient" | "room" | "blurred" | "texture">("solid");

  const [photoPosition, setPhotoPosition] = useState<"center" | "left" | "right" | "premium" | "background">("center");
  const [showReflection, setShowReflection] = useState<boolean>(true);
  const [showShadow, setShowShadow] = useState<boolean>(true);
  const [artBadge, setArtBadge] = useState<"none" | "bestseller" | "flash" | "launch" | "free_shipping" | "last_units" | "premium">("none");
  const [ctaText, setCtaText] = useState<string>("Comprar Agora");
  
  // Benefits
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([
    "Design moderno",
    "Alta durabilidade",
    "Fácil montagem"
  ]);

  // Export & compression options
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [exportQuality, setExportQuality] = useState<"alta" | "web" | "ultrahd">("alta");

  // AI Content State
  const [aiOutputs, setAiOutputs] = useState<any>(null);

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    min_purchase: 0,
    max_uses: "",
    expires_at: ""
  });
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  // Banners Form State
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoForm, setPromoForm] = useState({
    title_pt: "",
    title_es: "",
    subtitle_pt: "",
    subtitle_es: "",
    image_url: "",
    image_url_es: "",
    link_url: "",
    active: true
  });

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>, lang: "pt" | "es") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/webp", 0.85);
        if (lang === "pt") {
          setPromoForm((prev) => ({ ...prev, image_url: dataUrl }));
        } else {
          setPromoForm((prev) => ({ ...prev, image_url_es: dataUrl }));
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromoId) return;

    updatePromotion(editingPromoId, {
      title_pt: promoForm.title_pt,
      title_es: promoForm.title_es,
      subtitle_pt: promoForm.subtitle_pt || undefined,
      subtitle_es: promoForm.subtitle_es || undefined,
      image_url: promoForm.image_url,
      image_url_es: promoForm.image_url_es || undefined,
      link_url: promoForm.link_url,
      active: promoForm.active
    });

    setEditingPromoId(null);
    alert("Banner atualizado com sucesso!");
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Set initial product
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Load product image dynamically
  useEffect(() => {
    if (!activeProduct || !activeProduct.images || activeProduct.images.length === 0) {
      setLoadedImage(null);
      return;
    }
    const img = new window.Image();
    img.src = activeProduct.images[0];
    img.onload = () => {
      setLoadedImage(img);
    };
    img.onerror = () => {
      setLoadedImage(null);
    };
  }, [activeProduct]);

  // Pre-configured Color Presets
  const applyPreset = (preset: "slate" | "scandinavian" | "minimalist" | "gold" | "industrial" | "clean") => {
    setColorPreset(preset);
    switch (preset) {
      case "slate":
        setBgColor("#0F172A");
        setTextColor("#FFFFFF");
        setAccentColor("#F59E0B");
        break;
      case "scandinavian":
        setBgColor("#F5F2EB");
        setTextColor("#1E293B");
        setAccentColor("#768A7C");
        break;
      case "minimalist":
        setBgColor("#F8FAFC");
        setTextColor("#090D16");
        setAccentColor("#2563EB");
        break;
      case "gold":
        setBgColor("#08080A");
        setTextColor("#F8FAFC");
        setAccentColor("#D4AF37");
        break;
      case "industrial":
        setBgColor("#2B221E");
        setTextColor("#E2E8F0");
        setAccentColor("#D97706");
        break;
      case "clean":
        setBgColor("#FFFFFF");
        setTextColor("#0F172A");
        setAccentColor("#C2410C");
        break;
    }
  };

  // Helper dimensions
  const getFormatDimensions = (format: string) => {
    switch (format) {
      case "feed": return { width: 1080, height: 1080 };
      case "feed_vertical": return { width: 1080, height: 1350 };
      case "story": return { width: 1080, height: 1920 };
      case "whatsapp": return { width: 1080, height: 1920 };
      case "pinterest": return { width: 1000, height: 1500 };
      default: return { width: 1080, height: 1080 };
    }
  };

  // Hex to RGBA convert
  const hexToRgba = (hex: string, alpha: number) => {
    try {
      let r = 0, g = 0, b = 0;
      const cleanHex = hex.replace("#", "");
      if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
      } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return `rgba(0, 0, 0, ${alpha})`;
    }
  };

  // Lighten/Darken Hex Color
  const adjustColorBrightness = (hex: string, percent: number) => {
    try {
      let num = parseInt(hex.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00ff) + amt,
        B = (num & 0x0000ff) + amt;
      return (
        "#" +
        (
          0x1000000 +
          (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 0 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      );
    } catch (e) {
      return hex;
    }
  };

  // Helper drawing check icon
  const drawCheckIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y);
    ctx.lineTo(x - size * 0.1, y + size * 0.3);
    ctx.lineTo(x + size * 0.5, y - size * 0.4);
    ctx.stroke();
    ctx.restore();
  };

  // Helper drawing premium sticker badge
  const drawSticker = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, r: number, color: string, strokeColor: string) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Dotted dash border
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.arc(x, y, r - 5, 0, Math.PI * 2);
    ctx.stroke();

    // Text centering
    ctx.fillStyle = strokeColor;
    ctx.font = "bold 11px var(--font-sans), sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const words = text.split(" ");
    if (words.length === 1) {
      ctx.fillText(words[0], x, y);
    } else if (words.length === 2) {
      ctx.fillText(words[0], x, y - 7);
      ctx.fillText(words[1], x, y + 7);
    } else {
      ctx.fillText(words[0], x, y - 12);
      ctx.fillText(words[1], x, y);
      ctx.fillText(words[2] || "", x, y + 12);
    }
    ctx.restore();
  };

  // Helper: Draw Wrapped Text with smart scaling to avoid cutoffs
  const drawWrappedText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number = 2) => {
    const words = text.split(" ");
    let line = "";
    let lines = [];
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    const rendered = lines.slice(0, maxLines);
    rendered.forEach((l, index) => {
      ctx.fillText(l.trim(), x, y + index * lineHeight);
    });
    return rendered.length;
  };

  // Helper: Draw CTA Button on Canvas
  const drawCtaButton = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number, h: number, scale: number = 1) => {
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 12 * scale);
    ctx.fill();

    // Soft border stroke to button
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2.5 * scale;
    ctx.stroke();
    
    ctx.fillStyle = bgColor === "#FFFFFF" || bgColor === "#F8FAFC" ? "#0F172A" : "#FFFFFF";
    ctx.font = `bold ${Math.round(20 * scale)}px var(--font-sans), sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.toUpperCase(), x, y);
  };

  // Core drawing subroutine (supports high scale factor)
  const drawFlyer = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number = 1) => {
    if (!activeProduct) return;

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 1. DRAW BACKGROUND
    if (bgType === "solid") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === "gradient") {
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50 * scale, width / 2, height / 2, Math.max(width, height) * 0.7);
      grad.addColorStop(0, adjustColorBrightness(bgColor, 30));
      grad.addColorStop(1, bgColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === "room") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Draw modern architectural arch in background
      ctx.fillStyle = adjustColorBrightness(bgColor, bgColor === "#FFFFFF" || bgColor === "#F8FAFC" ? -5 : 10);
      ctx.beginPath();
      ctx.roundRect(width * 0.1, height * 0.1, width * 0.8, height * 0.68, 30 * scale);
      ctx.fill();

      // Floor line
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.78);
      ctx.lineTo(width, height * 0.78);
      ctx.stroke();

      // Soft ground shadow plane
      const floorGrad = ctx.createLinearGradient(width / 2, height * 0.78, width / 2, height);
      floorGrad.addColorStop(0, "rgba(0, 0, 0, 0.05)");
      floorGrad.addColorStop(1, "rgba(0, 0, 0, 0.15)");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, height * 0.78, width, height * 0.22);
    } else if (bgType === "blurred") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Draw soft gradient light bursts
      const radialL = ctx.createRadialGradient(width * 0.5, height * 0.5, 10 * scale, width * 0.5, height * 0.5, width * 0.65);
      radialL.addColorStop(0, hexToRgba(accentColor, 0.2));
      radialL.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radialL;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, width * 0.65, 0, Math.PI * 2);
      ctx.fill();
    } else if (bgType === "texture") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Fine structural grids
      ctx.strokeStyle = bgColor === "#FFFFFF" || bgColor === "#F8FAFC" ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1 * scale;
      const step = 40 * scale;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Outer framing border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = (canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? 20 : 12) * scale;
    ctx.strokeRect(6 * scale, 6 * scale, width - 12 * scale, height - 12 * scale);

    // 2. DRAW HEADER BRANDING
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.045, 16 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bgColor === "#FFFFFF" || bgColor === "#F8FAFC" ? "#0F172A" : "#FFFFFF";
    ctx.font = `bold ${Math.round(14 * scale)}px var(--font-sans), sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M", width / 2, height * 0.045);

    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.round(16 * scale)}px var(--font-sans), sans-serif`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Muebles.py".toUpperCase(), width / 2, height * 0.075);

    // 3. DRAW BADGE / SEAL
    if (artBadge !== "none") {
      let badgeLabel = "";
      if (artLanguage === "pt") {
        switch (artBadge) {
          case "bestseller": badgeLabel = "MAIS VENDIDO"; break;
          case "flash": badgeLabel = "OFERTA RELÂMPAGO"; break;
          case "launch": badgeLabel = "LANÇAMENTO"; break;
          case "free_shipping": badgeLabel = "FRETE GRÁTIS"; break;
          case "last_units": badgeLabel = "ÚLTIMAS UNIDADES"; break;
          case "premium": badgeLabel = "QUALIDADE PREMIUM"; break;
        }
      } else {
        switch (artBadge) {
          case "bestseller": badgeLabel = "MÁS VENDIDO"; break;
          case "flash": badgeLabel = "OFERTA RELÁMPAGO"; break;
          case "launch": badgeLabel = "LANZAMIENTO"; break;
          case "free_shipping": badgeLabel = "ENVÍO GRATIS"; break;
          case "last_units": badgeLabel = "ÚLTIMAS UNIDADES"; break;
          case "premium": badgeLabel = "CALIDAD PREMIUM"; break;
        }
      }
      drawSticker(ctx, badgeLabel, width * 0.86, height * 0.095, 55 * scale, accentColor, bgColor === "#FFFFFF" || bgColor === "#F8FAFC" ? "#0F172A" : "#FFFFFF");
    }

    // Product pricing structures
    const name = (artLanguage === "pt" ? activeProduct.name_pt : (activeProduct.name_es || activeProduct.name_pt)).toUpperCase();
    const price = activeProduct.promo_price || activeProduct.price;
    const originalPrice = activeProduct.price;
    const isPromoActive = !!activeProduct.promo_price;
    const discountPct = isPromoActive ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const formattedPrice = new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(price).replace("PYG", "Gs.");

    const formattedOriginal = new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(originalPrice).replace("PYG", "Gs.");

    // Compute Product Position coordinates
    let imgW = 0, imgH = 0;
    let imgX = width / 2, imgY = height * 0.52;

    if (loadedImage) {
      // Product Protagonist: 60% - 75% height/width
      const maxW = width * 0.65;
      const maxH = height * 0.44;
      const ratio = Math.min(maxW / loadedImage.width, maxH / loadedImage.height);
      imgW = loadedImage.width * ratio;
      imgH = loadedImage.height * ratio;
    }

    // Set position coordinates according to layout selection
    if (photoPosition === "center") {
      imgX = width / 2;
      imgY = canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? height * 0.46 : height * 0.52;
    } else if (photoPosition === "left") {
      imgX = canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? width / 2 : width * 0.32;
      imgY = canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? height * 0.34 : height * 0.52;
    } else if (photoPosition === "right") {
      imgX = canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? width / 2 : width * 0.68;
      imgY = canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? height * 0.58 : height * 0.52;
    } else if (photoPosition === "premium") {
      imgX = width / 2;
      imgY = canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? height * 0.44 : height * 0.50;

      // Draw premium glow aura behind the product
      const auraGrad = ctx.createRadialGradient(imgX, imgY, 10 * scale, imgX, imgY, Math.max(imgW, imgH) * 0.7);
      auraGrad.addColorStop(0, hexToRgba(accentColor, 0.25));
      auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(imgX, imgY, Math.max(imgW, imgH) * 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else if (photoPosition === "background") {
      imgX = width / 2;
      imgY = height / 2;
      imgW = width;
      imgH = height;
    }

    // Draw Floor shadow
    if (showShadow && loadedImage && photoPosition !== "background") {
      const shadowW = imgW * 0.85;
      const shadowH = imgH * 0.08;
      const shadowY = imgY + imgH / 2 - 5 * scale;
      const shadowGrad = ctx.createRadialGradient(imgX, shadowY, 2 * scale, imgX, shadowY, shadowW / 2);
      shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.42)");
      shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.18)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(imgX, shadowY, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Floor reflection
    if (showReflection && loadedImage && photoPosition !== "background") {
      ctx.save();
      const bottomY = imgY + imgH / 2 - 6 * scale;
      ctx.translate(imgX, bottomY);
      ctx.scale(1, -1);
      ctx.globalAlpha = 0.22;
      ctx.drawImage(loadedImage, -imgW / 2, -imgH / 2, imgW, imgH);
      ctx.restore();

      // Gradient overlay to fade reflection
      const overlayGrad = ctx.createLinearGradient(imgX, bottomY, imgX, bottomY + imgH * 0.5);
      overlayGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      overlayGrad.addColorStop(1, bgColor);
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(imgX - imgW / 2, bottomY, imgW, imgH * 0.5);
    }

    // Draw Product Image
    if (loadedImage) {
      if (photoPosition === "background") {
        let w = loadedImage.width;
        let h = loadedImage.height;
        const ratio = Math.max(width / w, height / h);
        w = w * ratio;
        h = h * ratio;
        ctx.drawImage(loadedImage, width / 2 - w / 2, height / 2 - h / 2, w, h);

        // Solid overlay
        ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
        ctx.fillRect(0, 0, width, height);

        // Re-draw border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = (canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? 20 : 12) * scale;
        ctx.strokeRect(6 * scale, 6 * scale, width - 12 * scale, height - 12 * scale);
      } else {
        ctx.drawImage(loadedImage, imgX - imgW / 2, imgY - imgH / 2, imgW, imgH);
      }
    }

    // 4. DRAW TITLES AND TEXTS
    ctx.textAlign = "center";
    ctx.fillStyle = textColor;

    let preTitle = "OFERTA ESPECIAL";
    if (templateType === "launch") preTitle = artLanguage === "pt" ? "NOVIDADE EXCLUSIVA" : "NOVEDAD EXCLUSIVA";
    else if (templateType === "destaque") preTitle = artLanguage === "pt" ? "TRANSFORME SUA CASA" : "TRANSFORMÁ TU HOGAR";
    else if (templateType === "promo") preTitle = artLanguage === "pt" ? "ELEGÂNCIA PARA SEU AMBIENTE" : "ELEGANCIA PARA TU AMBIENTE";

    if (photoPosition === "center" || photoPosition === "premium" || photoPosition === "background") {
      // CENTERED TEXTS (top or bottom depending on layout)
      const nameY = height * 0.15;
      
      // Draw pre-title
      ctx.font = `bold ${Math.round(13 * scale)}px var(--font-sans), sans-serif`;
      ctx.fillStyle = accentColor;
      ctx.fillText(preTitle.split("").join(" "), width / 2, nameY - 22 * scale);

      // Draw Main Title
      ctx.fillStyle = textColor;
      const titleFontSize = (canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? 42 : 36) * scale;
      ctx.font = `black ${titleFontSize}px var(--font-sans), sans-serif`;
      const titleLines = drawWrappedText(ctx, name, width / 2, nameY, width - 140 * scale, titleFontSize + 8 * scale, 2);

      // Draw price tag
      const priceY = nameY + (titleLines * (titleFontSize + 8 * scale)) + 10 * scale;
      if (isPromoActive) {
        ctx.fillStyle = "rgba(156, 163, 175, 0.85)";
        ctx.font = `bold ${Math.round(20 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(`De: ${formattedOriginal}`, width / 2, priceY);

        const origW = ctx.measureText(`De: ${formattedOriginal}`).width;
        ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(width / 2 - origW / 2 - 3 * scale, priceY - 6 * scale);
        ctx.lineTo(width / 2 + origW / 2 + 3 * scale, priceY - 6 * scale);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.font = `black ${Math.round(52 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(formattedPrice, width / 2, priceY + 54 * scale);

        // Savings Badge
        ctx.fillStyle = "#EF4444";
        ctx.font = `bold ${Math.round(13 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(artLanguage === "pt" ? `ECONOMIZE ${discountPct}%` : `AHORRÁ ${discountPct}%`, width / 2, priceY + 84 * scale);
      } else {
        ctx.fillStyle = accentColor;
        ctx.font = `black ${Math.round(58 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(formattedPrice, width / 2, priceY + 30 * scale);
      }
    } else if (photoPosition === "left") {
      // TEXTS ALIGNED RIGHT
      const textX = width * 0.72;
      const nameY = height * 0.28;

      ctx.fillStyle = accentColor;
      ctx.font = `bold ${Math.round(12 * scale)}px var(--font-sans), sans-serif`;
      ctx.fillText(preTitle.split("").join(" "), textX, nameY - 18 * scale);

      ctx.fillStyle = textColor;
      ctx.font = `black ${Math.round(32 * scale)}px var(--font-sans), sans-serif`;
      const titleLines = drawWrappedText(ctx, name, textX, nameY, width * 0.44, 40 * scale, 2);

      const priceY = nameY + (titleLines * 40 * scale) + 12 * scale;
      if (isPromoActive) {
        ctx.fillStyle = "rgba(156, 163, 175, 0.85)";
        ctx.font = `bold ${Math.round(18 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(`De: ${formattedOriginal}`, textX, priceY);

        const origW = ctx.measureText(`De: ${formattedOriginal}`).width;
        ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(textX - origW / 2 - 3 * scale, priceY - 6 * scale);
        ctx.lineTo(textX + origW / 2 + 3 * scale, priceY - 6 * scale);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.font = `black ${Math.round(44 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(formattedPrice, textX, priceY + 44 * scale);

        ctx.fillStyle = "#EF4444";
        ctx.font = `bold ${Math.round(12 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(artLanguage === "pt" ? `POUPE ${discountPct}%` : `AHORRÁ ${discountPct}%`, textX, priceY + 70 * scale);
      } else {
        ctx.fillStyle = accentColor;
        ctx.font = `black ${Math.round(48 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(formattedPrice, textX, priceY + 28 * scale);
      }
    } else if (photoPosition === "right") {
      // TEXTS ALIGNED LEFT
      const textX = width * 0.28;
      const nameY = height * 0.28;

      ctx.fillStyle = accentColor;
      ctx.font = `bold ${Math.round(12 * scale)}px var(--font-sans), sans-serif`;
      ctx.fillText(preTitle.split("").join(" "), textX, nameY - 18 * scale);

      ctx.fillStyle = textColor;
      ctx.font = `black ${Math.round(32 * scale)}px var(--font-sans), sans-serif`;
      const titleLines = drawWrappedText(ctx, name, textX, nameY, width * 0.44, 40 * scale, 2);

      const priceY = nameY + (titleLines * 40 * scale) + 12 * scale;
      if (isPromoActive) {
        ctx.fillStyle = "rgba(156, 163, 175, 0.85)";
        ctx.font = `bold ${Math.round(18 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(`De: ${formattedOriginal}`, textX, priceY);

        const origW = ctx.measureText(`De: ${formattedOriginal}`).width;
        ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(textX - origW / 2 - 3 * scale, priceY - 6 * scale);
        ctx.lineTo(textX + origW / 2 + 3 * scale, priceY - 6 * scale);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.font = `black ${Math.round(44 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(formattedPrice, textX, priceY + 44 * scale);

        ctx.fillStyle = "#EF4444";
        ctx.font = `bold ${Math.round(12 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(artLanguage === "pt" ? `POUPE ${discountPct}%` : `AHORRÁ ${discountPct}%`, textX, priceY + 70 * scale);
      } else {
        ctx.fillStyle = accentColor;
        ctx.font = `black ${Math.round(48 * scale)}px var(--font-sans), sans-serif`;
        ctx.fillText(formattedPrice, textX, priceY + 28 * scale);
      }
    }

    // 5. DRAW BENEFITS
    if (selectedBenefits.length > 0) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(16 * scale)}px var(--font-sans), sans-serif`;
      ctx.textAlign = "left";

      let benefitsX = width * 0.08;
      let benefitsY = height * 0.78;

      if (canvasFormat.includes("story") || canvasFormat.includes("whatsapp")) {
        benefitsX = width * 0.15;
        benefitsY = height * 0.72;
      }

      if (photoPosition === "left") {
        benefitsX = width * 0.58;
        benefitsY = height * 0.58;
      } else if (photoPosition === "right") {
        benefitsX = width * 0.12;
        benefitsY = height * 0.58;
      }

      const mappedBenefits = selectedBenefits.slice(0, 6).map((b) => BENEFITS_MAP[b] ? (artLanguage === "pt" ? BENEFITS_MAP[b].pt : BENEFITS_MAP[b].es) : b);

      // Draw grid in feed layout
      if (canvasFormat === "feed" && photoPosition === "center") {
        const colW = width * 0.40;
        mappedBenefits.forEach((benefit, idx) => {
          const r = idx % 2;
          const c = Math.floor(idx / 2);
          const itemX = width * 0.14 + r * colW;
          const itemY = height * 0.81 + c * 28 * scale;

          drawCheckIcon(ctx, itemX, itemY - 5 * scale, 14 * scale, accentColor);
          
          ctx.fillStyle = textColor;
          ctx.font = `bold ${Math.round(15 * scale)}px var(--font-sans), sans-serif`;
          ctx.fillText(benefit, itemX + 16 * scale, itemY);
        });
      } else {
        mappedBenefits.forEach((benefit, idx) => {
          const itemY = benefitsY + idx * 28 * scale;
          drawCheckIcon(ctx, benefitsX + 10, itemY - 5 * scale, 14 * scale, accentColor);
          
          ctx.fillStyle = textColor;
          ctx.font = `bold ${Math.round(16 * scale)}px var(--font-sans), sans-serif`;
          ctx.fillText(benefit, benefitsX + 32 * scale, itemY);
        });
      }
      ctx.restore();
    }

    // 6. DRAW CTA BUTTON
    let buttonY = height * 0.91;
    let buttonX = width / 2;

    if (canvasFormat.includes("story") || canvasFormat.includes("whatsapp")) {
      buttonY = height * 0.88;
    }

    if (photoPosition === "left") {
      buttonX = width * 0.72;
      buttonY = height * 0.82;
    } else if (photoPosition === "right") {
      buttonX = width * 0.28;
      buttonY = height * 0.82;
    }

    const buttonW = (canvasFormat.includes("story") || canvasFormat.includes("whatsapp") ? 360 : 300) * scale;
    const buttonH = 58 * scale;
    drawCtaButton(ctx, getCtaLabel(ctaText, artLanguage), buttonX, buttonY, buttonW, buttonH, scale);
  };

  // Main Live Preview Hook
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = getFormatDimensions(canvasFormat);
    canvas.width = width;
    canvas.height = height;

    drawFlyer(ctx, width, height, 1);
  }, [
    activeProduct,
    templateType,
    canvasFormat,
    bgColor,
    textColor,
    accentColor,
    bgType,
    photoPosition,
    showReflection,
    showShadow,
    artBadge,
    ctaText,
    selectedBenefits,
    loadedImage,
    artLanguage
  ]);

  // Optimize flyer with IA
  const handleOptimizeWithAI = () => {
    if (!activeProduct) return;
    
    // Choose theme by category keywords
    const name = activeProduct.name_pt.toLowerCase();
    
    if (name.includes("gamer") || name.includes("carbon") || name.includes("ares")) {
      applyPreset("slate"); // Gamer = Slate
      setBgType("texture");
    } else if (name.includes("wood") || name.includes("steel") || name.includes("mesa") || name.includes("estante")) {
      applyPreset("scandinavian"); // Wood furniture = Scandinavian
      setBgType("room");
    } else if (name.includes("tv") || name.includes("samsung") || name.includes("airfryer") || name.includes("philips")) {
      applyPreset("minimalist"); // Tech = Minimalist
      setBgType("gradient");
    } else {
      applyPreset("gold"); // Luxe / Gold
      setBgType("solid");
    }

    // Set position and show reflections
    setPhotoPosition("premium");
    setShowShadow(true);
    setShowReflection(true);

    // Limit benefits to avoid clutter
    const list = [];
    if (activeProduct.material_pt) list.push("Acabamento premium");
    if (activeProduct.warranty_pt) list.push("Alta durabilidade");
    list.push("Design moderno");
    setSelectedBenefits(list.slice(0, 3));

    // Choose badges and templates
    if (activeProduct.promo_price) {
      setArtBadge("flash");
      setTemplateType("flash");
    } else {
      setArtBadge("premium");
      setTemplateType("destaque");
    }
    setCtaText(artLanguage === "pt" ? "Garanta o Seu" : "Llevá el Tuyo");
  };

  // High-fidelity multi-format download exporter
  const handleDownload = () => {
    if (!activeProduct || !canvasRef.current) return;

    // Create a temporary canvas for scaling
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const { width, height } = getFormatDimensions(canvasFormat);
    
    // Calculate scale factor by quality level
    let scale = 1;
    if (exportQuality === "ultrahd") {
      scale = 2; // Double resolution (e.g. 2160x2160)
    } else if (exportQuality === "web") {
      scale = 0.8; // Compressed resolution for faster web load
    }

    tempCanvas.width = width * scale;
    tempCanvas.height = height * scale;

    // Draw scale-factored flyer content
    drawFlyer(tempCtx, tempCanvas.width, tempCanvas.height, scale);

    // Get mime type
    let mimeType = "image/png";
    let extension = "png";
    let quality = 0.95;

    if (exportFormat === "jpeg") {
      mimeType = "image/jpeg";
      extension = "jpg";
    } else if (exportFormat === "webp") {
      mimeType = "image/webp";
      extension = "webp";
    }

    const dataUrl = tempCanvas.toDataURL(mimeType, quality);

    const link = document.createElement("a");
    link.download = `muebles_flyer_${activeProduct.slug}_${canvasFormat}_${exportQuality}.${extension}`;
    link.href = dataUrl;
    link.click();
  };

  const handleGenerateAICopy = () => {
    if (!activeProduct) return;
    const name = copyLanguage === "es" ? (activeProduct.name_es || activeProduct.name_pt) : activeProduct.name_pt;
    const desc = copyLanguage === "es" ? (activeProduct.description_es || activeProduct.description_pt) : activeProduct.description_pt;
    const price = activeProduct.promo_price || activeProduct.price;
    const formattedPrice = new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(price).replace("PYG", "Gs.");

    if (copyLanguage === "es") {
      setAiOutputs({
        caption: `🔥 ¡NOVEDAD EN PARAGUAY! Conocé la ${name}.\n\nTu espacio de trabajo o home office nunca más será el mismo. Desarrollada con ergonomía de alta performance, une confort premium, durabilidad extrema y diseño minimalista sofisticado.\n\n💥 ¡Precio promocional por tempo limitado: de ${new Intl.NumberFormat("es-PY", {style:"currency",currency:"PYG",minimumFractionDigits:0}).format(activeProduct.price).replace("PYG","Gs.")} por tan solo ${formattedPrice}!\n\n🚛 Entregamos y montamos en varias zonas de Paraguay.\n👉 ¡Hacé clic en el enlace de la bio o escribinos directo al WhatsApp +595 973953874 para asegurar la tuya!`,
        whatsapp: `*Muebles Premium Muebles.py* 🚚\n\n*${name}* - ¡Ergonómica de Alto Nivel!\n\n${desc}\n\n💵 *Oferta:* ¡por solo *${formattedPrice}*!\n\n✅ Garantía estructural\n✅ Pronta entrega y montaje rápido\n\nContactanos en el enlace para reservar la tuya:\nhttps://wa.me/595973953874`,
        adText: `¿Te duele la espalda después de horas de trabajo? Transformá tu rutina con la ${name}. Confort ergonómico premium y soporte total. Comprá online y recibí con seguridad. ¡Hacemos envíos y montaje!`,
        textTag: `@mueblespy`,
        hashtags: `#mueblespy #sillasergonomicas #homeofficeparaguay #sillasparaguay #decoracionpy #escritoriopy #asuncion #ciudaddeleste`
      });
    } else {
      setAiOutputs({
        caption: `🔥 NOVIDADE NO PARAGUAI! Conheça a ${name}.\n\nSeu ambiente de trabalho ou home office nunca mais será o mesmo. Desenvolvida com ergonomia de alta performance, ela une conforto premium, durabilidade extrema e design minimalista sofisticado.\n\n💥 Preço promocional por tempo limitado: de ${new Intl.NumberFormat("es-PY", {style:"currency",currency:"PYG",minimumFractionDigits:0}).format(activeProduct.price).replace("PYG","Gs.")} por apenas ${formattedPrice}!\n\n🚛 Entregamos e montamos em diversas regiões do Paraguai.\n👉 Clique no link da bio ou chame direto no WhatsApp +595 973953874 para garantir a sua!`,
        whatsapp: `*Móveis Premium Muebles.py* 🚚\n\n*${name}* - Ergonômica de Alto Padrão!\n\n${desc}\n\n💵 *Oferta:* por apenas *${formattedPrice}*!\n\n✅ Garantia estrutural\n✅ Pronta entrega e montagem rápida\n\nFale conosco pelo link e reserve a sua:\nhttps://wa.me/595973953874`,
        adText: `Sua coluna dói após horas de trabalho? Transforme sua rotina com a ${name}. Conforto ergonômico premium e suporte integral. Parcele direto ou compre com desconto no pix. Compre online e receba com segurança!`,
        textTag: `@mueblespy`,
        hashtags: `#mueblespy #cadeiramergonomicas #homeofficeparaguay #moveisassuncao #sillasparaguay #decoracionpy #escritoriopy`
      });
    }
  };

  // Coupons Manager handlers
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    const payload = {
      code: couponForm.code.toUpperCase().trim(),
      type: couponForm.type,
      value: Number(couponForm.value),
      min_purchase: Number(couponForm.min_purchase) || 0,
      max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : undefined,
      expires_at: couponForm.expires_at || undefined,
      active: true
    };

    if (editingCouponId) {
      editCoupon(editingCouponId, payload);
      setEditingCouponId(null);
    } else {
      addCoupon(payload);
    }

    setCouponForm({
      code: "",
      type: "percentage",
      value: 0,
      min_purchase: 0,
      max_uses: "",
      expires_at: ""
    });
  };

  const handleEditClick = (c: any) => {
    setEditingCouponId(c.id);
    setCouponForm({
      code: c.code,
      type: c.type,
      value: c.value,
      min_purchase: c.min_purchase || 0,
      max_uses: c.max_uses ? String(c.max_uses) : "",
      expires_at: c.expires_at || ""
    });
  };

  const handleToggleActive = (c: any) => {
    editCoupon(c.id, { active: !c.active });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0
    }).format(val).replace("PYG", "Gs.");
  };

  // Metrics calculations for reports
  const totalUses = coupons.reduce((acc, curr) => acc + curr.usage_count, 0);
  const totalDiscounts = orders.reduce((acc, curr) => acc + (curr.discount_amount || 0), 0);
  const totalInfluencedSales = orders
    .filter((o) => o.coupon_code)
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="space-y-6 font-sans text-slate-950">
      
      {/* Header Panel */}
      <div className="border-b border-slate-100 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Central de Marketing & Promoções</h1>
          <p className="text-xs text-slate-500 font-bold">Crie artes publicitárias, textos com IA e gerencie cupons de descontos para a loja</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2.5 pb-4">
        <button
          onClick={() => setActiveTab("canvas")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === "canvas"
              ? "bg-amber-500 text-slate-950 border-transparent font-black"
              : "border-slate-200 text-slate-655 bg-white hover:bg-slate-50"
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Gerador de Artes</span>
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === "ai"
              ? "bg-amber-500 text-slate-950 border-transparent font-black"
              : "border-slate-200 text-slate-655 bg-white hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Copywriter IA</span>
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === "schedule"
              ? "bg-amber-500 text-slate-950 border-transparent font-black"
              : "border-slate-200 text-slate-655 bg-white hover:bg-slate-50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agendamento de Posts</span>
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === "coupons"
              ? "bg-amber-500 text-slate-950 border-transparent font-black"
              : "border-slate-200 text-slate-655 bg-white hover:bg-slate-50"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Cupons de Desconto</span>
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === "banners"
              ? "bg-amber-500 text-slate-950 border-transparent font-black"
              : "border-slate-200 text-slate-655 bg-white hover:bg-slate-50"
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Banners da Loja</span>
        </button>
      </div>

      {/* Canvas Generator Tab */}
      {activeTab === "canvas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-xs font-bold">
          
          {/* Controls Editor (Left) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* AI Optimization Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl p-5 border-0 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-slate-950 animate-pulse" />
                  <span>Otimização Inteligente</span>
                </h3>
                <p className="text-[10px] font-bold text-amber-950 leading-relaxed">
                  Ajuste automaticamente tipografia, paleta de cores e disposição dos elementos para alta conversão.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOptimizeWithAI}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-black border-0 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                MELHORAR COM IA
              </button>
            </div>

            {/* Quick mobile anchor button to scroll to canvas */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("canvas-preview-container")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-extrabold text-xs transition-all uppercase tracking-wider cursor-pointer shadow-sm border-0"
              >
                <span>👁️ Ver Preview da Arte</span>
              </button>
            </div>

            {/* Editor Box */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-5">
              
              {/* Product and Format */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                  <span>📁</span> Produto & Formato
                </h3>
                
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Idioma da Arte (Flyer)</label>
                  <select
                    value={artLanguage}
                    onChange={(e: any) => setArtLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="pt">🇧🇷 Português (Brasil)</option>
                    <option value="es">🇵🇾 Español (Paraguay)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Selecionar Produto</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {artLanguage === "pt" ? p.name_pt : (p.name_es || p.name_pt)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Formato do Post</label>
                  <select
                    value={canvasFormat}
                    onChange={(e: any) => setCanvasFormat(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="feed">Feed Quadrado (1080x1080) - Instagram/FB</option>
                    <option value="feed_vertical">Feed Vertical (1080x1350) - Retrato</option>
                    <option value="story">Story (1080x1920) - Instagram/WhatsApp</option>
                    <option value="whatsapp">WhatsApp Status (1080x1920) - Status</option>
                    <option value="pinterest">Pinterest Pin (1000x1500) - 2:3 aspect</option>
                  </select>
                </div>
              </div>

              {/* Layout and Style */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                  <span>🎨</span> Estilo & Fundo
                </h3>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase block mb-1">Paletas de Cores</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "slate", label: "Slate Escuro" },
                      { id: "scandinavian", label: "Escandinavo" },
                      { id: "minimalist", label: "Minimalista" },
                      { id: "gold", label: "Luxo Dourado" },
                      { id: "industrial", label: "Industrial" },
                      { id: "clean", label: "Clean Branco" }
                    ].map((pal) => (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => applyPreset(pal.id as any)}
                        className={`px-1 py-1.5 border rounded-lg text-[10px] text-center transition-colors cursor-pointer ${
                          colorPreset === pal.id ? "bg-slate-950 text-white border-slate-950" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {pal.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Estilo de Fundo</label>
                    <select
                      value={bgType}
                      onChange={(e: any) => setBgType(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="solid">Fundo Sólido</option>
                      <option value="gradient">Gradiente Suave</option>
                      <option value="room">Ambiente Decorado</option>
                      <option value="blurred">Ambiente Desfocado</option>
                      <option value="texture">Textura de Grid</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Cor do Fundo</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <span className="font-mono text-[10px]">{bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo position and adjustments */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                  <span>🖼️</span> Foto do Produto
                </h3>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Posição da Foto</label>
                  <select
                    value={photoPosition}
                    onChange={(e: any) => setPhotoPosition(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="center">Centralizada</option>
                    <option value="left">Esquerda (Texto à Direita)</option>
                    <option value="right">Direita (Texto à Esquerda)</option>
                    <option value="premium">Destaque Premium (Aura Luminosa)</option>
                    <option value="background">Fundo Ambiente (Fosco)</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showShadow}
                      onChange={(e) => setShowShadow(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-0"
                    />
                    <span>Sombra Suave</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showReflection}
                      onChange={(e) => setShowReflection(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-0"
                    />
                    <span>Reflexo Realista</span>
                  </label>
                </div>
              </div>

              {/* Titles, Badges & CTA */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                  <span>🏷️</span> Textos & Chamada (CTA)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Modelo de Título</label>
                    <select
                      value={templateType}
                      onChange={(e: any) => setTemplateType(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="promo">Promoção (Elegância)</option>
                      <option value="flash">Oferta Relâmpago</option>
                      <option value="launch">Lançamento</option>
                      <option value="destaque">Destaque (Transforme)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Selo Promocional</label>
                    <select
                      value={artBadge}
                      onChange={(e: any) => setArtBadge(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="none">Sem Selo</option>
                      <option value="bestseller">🔥 Mais Vendido</option>
                      <option value="flash">⚡ Oferta Relâmpago</option>
                      <option value="launch">✨ Lançamento</option>
                      <option value="free_shipping">🚚 Frete Grátis</option>
                      <option value="last_units">⚠️ Últimas Unidades</option>
                      <option value="premium">💎 Premium</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Texto do Botão (CTA)</label>
                  <select
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {artLanguage === "pt" ? (
                      <>
                        <option value="Comprar Agora">Comprar Agora</option>
                        <option value="Saiba Mais">Saiba Mais</option>
                        <option value="Ver Oferta">Ver Oferta</option>
                        <option value="Pedir no WhatsApp">Pedir no WhatsApp</option>
                        <option value="Garanta o Seu">Garanta o Seu</option>
                      </>
                    ) : (
                      <>
                        <option value="Comprar Ahora">Comprar Ahora</option>
                        <option value="Saber Más">Saber Más</option>
                        <option value="Ver Oferta">Ver Oferta</option>
                        <option value="Pedir por WhatsApp">Pedir por WhatsApp</option>
                        <option value="Llevá el Tuyo">Llevá el Tuyo</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Benefits checklist */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                  <span>✅</span> {artLanguage === "pt" ? "Benefícios (Máx. 6)" : "Beneficios (Máx. 6)"}
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(BENEFITS_MAP).map((benefitKey) => {
                    const isChecked = selectedBenefits.includes(benefitKey);
                    const benefitLabel = artLanguage === "pt" ? BENEFITS_MAP[benefitKey].pt : BENEFITS_MAP[benefitKey].es;
                    return (
                      <label key={benefitKey} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedBenefits(selectedBenefits.filter((b) => b !== benefitKey));
                            } else {
                              if (selectedBenefits.length < 6) {
                                setSelectedBenefits([...selectedBenefits, benefitKey]);
                              } else {
                                alert(artLanguage === "pt" ? "Você pode selecionar no máximo 6 benefícios." : "Podés seleccionar un máximo de 6 beneficios.");
                              }
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-350 text-slate-950 focus:ring-0"
                        />
                        <span>{benefitLabel}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Export Panel */}
              <div className="space-y-4 pt-3 border-t border-slate-150">
                <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1">
                  <span>💾</span> Exportar Banner
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Formato do Arquivo</label>
                    <select
                      value={exportFormat}
                      onChange={(e: any) => setExportFormat(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="png">PNG (Transparência)</option>
                      <option value="jpeg">JPG (Compacto)</option>
                      <option value="webp">WebP (Moderno)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Qualidade</label>
                    <select
                      value={exportQuality}
                      onChange={(e: any) => setExportQuality(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="alta">Alta (Resolução Real)</option>
                      <option value="web">Web Otimizada (Comprimido)</option>
                      <option value="ultrahd">Ultra HD 2x (Alta Fidelidade)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-black border-0 shadow-sm transition-all cursor-pointer mt-2 text-xs uppercase tracking-wider"
                >
                  <Download className="w-5 h-5 text-accent-amber" />
                  <span>Baixar Flyer Publicitário</span>
                </button>
              </div>

            </div>
          </div>

          {/* Canvas Output Display (Right Preview) */}
          <div id="canvas-preview-container" className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl p-6 overflow-hidden relative shadow-inner min-h-[500px]">
            
            <div className="text-center mb-4 space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-widest">Visualização em Tempo Real</span>
              <span className="text-xs font-bold text-slate-750">Dimensões Preview: {getFormatDimensions(canvasFormat).width}x{getFormatDimensions(canvasFormat).height}px</span>
            </div>

            <div className="max-w-full overflow-auto max-h-[640px] border border-slate-150 shadow-lg rounded-xl bg-white p-2">
              <canvas
                ref={canvasRef}
                className="mx-auto block border border-slate-100"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  width: (() => {
                    if (canvasFormat === "feed") return "380px";
                    if (canvasFormat === "feed_vertical") return "310px";
                    if (canvasFormat === "pinterest") return "250px";
                    return "220px"; // Story / Status
                  })()
                }}
              />
            </div>

            <p className="text-[10px] text-slate-400 mt-4 text-center">
              * A qualidade real do download é otimizada na resolução nativa do formato selecionado.
            </p>
          </div>

        </div>
      )}

      {/* AI Copywriter Tab */}
      {activeTab === "ai" && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6 animate-fade-in">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Gerador de Copys para Anúncios e Posts</h2>
              <p className="text-xs text-slate-455">Gere legendas, mensagens de WhatsApp e tags para engajar clientes</p>
            </div>
            <button
              onClick={handleGenerateAICopy}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-0"
            >
              <Sparkles className="w-4 h-4 text-accent-amber" />
              <span>Gerar Textos Inteligentes</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="w-full max-w-sm text-xs space-y-1.5 font-bold">
                <label className="font-bold text-slate-500 uppercase">Selecionar Produto de Referência</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{locale === "pt" ? p.name_pt : p.name_es}</option>
                  ))}
                </select>
              </div>

              <div className="w-full max-w-xs text-xs space-y-1.5 font-bold">
                <label className="font-bold text-slate-500 uppercase">Idioma de Geração</label>
                <select
                  value={copyLanguage}
                  onChange={(e) => setCopyLanguage(e.target.value as "pt" | "es")}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="pt">🇧🇷 Português (Brasil)</option>
                  <option value="es">🇵🇾 Español (Paraguay)</option>
                </select>
              </div>
            </div>

            {aiOutputs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs font-bold">
                
                {/* Instagram Caption */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-2 relative shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Instagram Caption</span>
                  <pre className="whitespace-pre-wrap font-sans text-slate-650 leading-relaxed max-h-56 overflow-y-auto pr-1">
                    {aiOutputs.caption}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiOutputs.caption);
                      alert("Legenda copiada!");
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-amber-600 bg-transparent border-none cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                  >
                    Copiar
                  </button>
                </div>

                {/* WhatsApp Message */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-2 relative shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">WhatsApp / Telegram broadcast</span>
                  <pre className="whitespace-pre-wrap font-mono text-[10px] text-slate-650 leading-relaxed max-h-56 overflow-y-auto pr-1">
                    {aiOutputs.whatsapp}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiOutputs.whatsapp);
                      alert("Texto do WhatsApp copiado!");
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-amber-600 bg-transparent border-none cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                  >
                    Copiar
                  </button>
                </div>

                {/* Short Facebook / Google Ad copy */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-2 relative shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Anúncio Curto (Meta Ads)</span>
                  <p className="text-slate-650 leading-relaxed font-sans pt-1">
                    {aiOutputs.adText}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiOutputs.adText);
                      alert("Texto de anúncio copiado!");
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-amber-600 bg-transparent border-none cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                  >
                    Copiar
                  </button>
                </div>

                {/* Hashtags list */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-2 relative shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hashtags Recomendadas</span>
                  <p className="text-slate-655 font-mono pt-1 text-[10px]">
                    {aiOutputs.hashtags}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiOutputs.hashtags);
                      alert("Hashtags copiadas!");
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-amber-600 bg-transparent border-none cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                  >
                    Copiar
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 border border-slate-200 border-dashed rounded-xl font-bold bg-white shadow-inner">
                Selecione o produto e clique em "Gerar Textos Inteligentes" acima para obter copys profissionais instantaneamente.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Schedule / Agendamento Logs Tab */}
      {activeTab === "schedule" && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Agendamento de Publicações</h2>
            <p className="text-xs text-slate-455">Monitore os posts agendados para suas redes sociais oficiais</p>
          </div>

          <div className="overflow-x-auto text-xs font-bold">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                  <th className="px-5 py-3">Data Programada</th>
                  <th className="px-5 py-3">Plataforma</th>
                  <th className="px-5 py-3">Tipo de Post</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-mono text-slate-400">29/06/2026 - 18:00</td>
                  <td className="px-5 py-4 font-bold text-slate-700">Instagram / Facebook</td>
                  <td className="px-5 py-4">Promoção Cadeira Executive Pro (Feed)</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                      Rascunho
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-mono text-slate-400">01/07/2026 - 09:30</td>
                  <td className="px-5 py-4 font-bold text-slate-700">Instagram Stories</td>
                  <td className="px-5 py-4">Lançamento Smart TV QLED (Story)</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      Agendado
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 text-xs text-slate-500 leading-relaxed max-w-lg">
            <strong>Integrações API:</strong> Para efetuar postagens diretas, configure os tokens de acesso Meta (Facebook Graph API) no menu de configurações do seu Painel Executivo Principal.
          </div>
        </div>
      )}

      {/* Coupons Manager Tab */}
      {activeTab === "coupons" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Usos de Cupons</p>
                <h3 className="text-2xl font-black text-slate-950 font-mono mt-1">{totalUses}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Total Descontado</p>
                <h3 className="text-2xl font-black text-slate-950 font-mono mt-1">{formatCurrency(totalDiscounts)}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Faturamento Influenciado</p>
                <h3 className="text-2xl font-black text-slate-950 font-mono mt-1">{formatCurrency(totalInfluencedSales)}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side editor form */}
            <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-xs font-bold space-y-4">
              <h2 className="text-sm font-black uppercase text-slate-900 border-b border-slate-100 pb-2">
                {editingCouponId ? "Editar Cupom de Desconto" : "Novo Cupom de Desconto"}
              </h2>

              <form onSubmit={handleSaveCoupon} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Código do Cupom *</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    placeholder="Ex: COZINHA20"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50/50 font-mono font-bold text-sm uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Tipo *</label>
                    <select
                      value={couponForm.type}
                      onChange={(e: any) => setCouponForm({ ...couponForm, type: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50/50 font-bold"
                    >
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Fixo (Gs.)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Valor *</label>
                    <input
                      type="number"
                      required
                      value={couponForm.value}
                      onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50/50 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Compra Mínima (Gs.)</label>
                  <input
                    type="number"
                    value={couponForm.min_purchase}
                    onChange={(e) => setCouponForm({ ...couponForm, min_purchase: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50/50 font-mono font-bold"
                    placeholder="0 para sem mínimo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Limite de Usos</label>
                    <input
                      type="number"
                      value={couponForm.max_uses}
                      onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50/50 font-mono font-bold"
                      placeholder="Sem limite"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase">Data Expiração</label>
                    <input
                      type="date"
                      value={couponForm.expires_at}
                      onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50/50 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  {editingCouponId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCouponId(null);
                        setCouponForm({ code: "", type: "percentage", value: 0, min_purchase: 0, max_uses: "", expires_at: "" });
                      }}
                      className="w-1/2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-all cursor-pointer text-center bg-white text-slate-500 shadow-sm"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-all text-center border-0 shadow-sm ${editingCouponId ? "w-1/2" : "w-full"}`}
                  >
                    {editingCouponId ? "Salvar" : "Criar Cupom"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right side listing table */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Cupons Disponíveis</h2>
              
              <div className="overflow-x-auto text-xs font-bold">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100 text-[10px]">
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Desconto</th>
                      <th className="px-4 py-3">Mínimo Compra</th>
                      <th className="px-4 py-3 text-center">Usos</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                    {coupons.map((c) => {
                      const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                      const isExhausted = c.max_uses && c.usage_count >= c.max_uses;
                      const isActive = c.active && !isExpired && !isExhausted;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-sm text-slate-950 uppercase">{c.code}</td>
                          <td className="px-4 py-3 text-slate-950">
                            {c.type === "percentage" ? `${c.value}%` : formatCurrency(c.value)}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {c.min_purchase ? formatCurrency(c.min_purchase) : "Sem mínimo"}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-650">
                            {c.usage_count} {c.max_uses ? `/ ${c.max_uses}` : ""}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isActive ? (
                              <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-extrabold">Ativo</span>
                            ) : (
                              <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-extrabold">
                                {isExpired ? "Expirado" : isExhausted ? "Esgotado" : "Inativo"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => handleToggleActive(c)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-colors cursor-pointer ${
                                  c.active 
                                    ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-500" 
                                    : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-600"
                                }`}
                              >
                                {c.active ? "Desativar" : "Ativar"}
                              </button>
                              <button
                                onClick={() => handleEditClick(c)}
                                className="px-2.5 py-1 bg-amber-50/50 hover:bg-amber-100/50 text-amber-600 border border-amber-100 rounded-lg text-[9px] font-bold cursor-pointer transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Excluir cupom ${c.code}?`)) {
                                    deleteCoupon(c.id);
                                  }
                                }}
                                className="p-1 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-650 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      )}

      {/* Banners Manager Tab */}
      {activeTab === "banners" && (
        <div className="space-y-6 animate-fade-in text-xs font-bold">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Banners e Destaques da Loja</h2>
                <p className="text-xs text-slate-500 font-medium">Gerencie os banners principais (PT/ES) exibidos no site</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {promotions.map((p) => (
                <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[9px] uppercase font-black">
                        {p.type === "hero" ? "Banner Principal (Hero)" : p.type === "primary_banner" ? "Banner Secundário (Meio)" : "Banner Terciário (Rodapé)"}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white aspect-video relative flex items-center justify-center">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title_pt} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-slate-400">Sem imagem PT</span>
                      )}
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-1.5 py-0.5 rounded text-[8px]">PT (Português)</div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white aspect-video relative flex items-center justify-center">
                      {p.image_url_es || p.image_url ? (
                        <img src={p.image_url_es || p.image_url} alt={p.title_es} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-slate-400">Sem imagem ES</span>
                      )}
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-1.5 py-0.5 rounded text-[8px]">ES (Español)</div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-slate-900 text-xs font-black truncate">{p.title_pt || "Sem título"}</h4>
                      <p className="text-slate-500 text-[10px] truncate">{p.subtitle_pt || "Sem subtítulo"}</p>
                    </div>

                    <div className="space-y-1 border-t pt-2 border-slate-200">
                      <h4 className="text-slate-800 text-xs font-black truncate">{p.title_es || "Sin título"}</h4>
                      <p className="text-slate-400 text-[10px] truncate">{p.subtitle_es || "Sin subtítulo"}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPromoId(p.id);
                      setPromoForm({
                        title_pt: p.title_pt,
                        title_es: p.title_es,
                        subtitle_pt: p.subtitle_pt || "",
                        subtitle_es: p.subtitle_es || "",
                        image_url: p.image_url,
                        image_url_es: p.image_url_es || "",
                        link_url: p.link_url || "",
                        active: p.active
                      });
                      setTimeout(() => {
                        document.getElementById("promo-editor-form")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="w-full py-2.5 bg-slate-950 text-white hover:bg-slate-900 text-center font-bold text-xs rounded-lg transition-colors cursor-pointer border-0"
                  >
                    Editar Banner
                  </button>
                </div>
              ))}
            </div>
          </div>

          {editingPromoId && (
            <div id="promo-editor-form" className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">
              <h2 className="text-sm font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex justify-between items-center">
                <span>Editar Banner selecionado</span>
                <button
                  type="button"
                  onClick={() => setEditingPromoId(null)}
                  className="text-xs text-red-500 hover:underline uppercase bg-transparent border-none cursor-pointer"
                >
                  Fechar Editor
                </button>
              </h2>

              <form onSubmit={handlePromoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-bold text-slate-800 text-xs">
                    <label className="text-slate-500 uppercase">Título (Português) *</label>
                    <input
                      type="text"
                      required
                      value={promoForm.title_pt}
                      onChange={(e) => setPromoForm({ ...promoForm, title_pt: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5 font-bold text-slate-800 text-xs">
                    <label className="text-slate-500 uppercase">Título (Español) *</label>
                    <input
                      type="text"
                      required
                      value={promoForm.title_es}
                      onChange={(e) => setPromoForm({ ...promoForm, title_es: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-bold text-slate-800 text-xs">
                    <label className="text-slate-500 uppercase">Subtítulo (Português)</label>
                    <textarea
                      value={promoForm.subtitle_pt}
                      onChange={(e) => setPromoForm({ ...promoForm, subtitle_pt: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5 font-bold text-slate-800 text-xs">
                    <label className="text-slate-500 uppercase">Subtítulo (Español)</label>
                    <textarea
                      value={promoForm.subtitle_es}
                      onChange={(e) => setPromoForm({ ...promoForm, subtitle_es: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-bold text-slate-800 text-xs">
                    <label className="text-slate-500 uppercase">Link de Destino (Ex: #produtos ou /category/...)</label>
                    <input
                      type="text"
                      value={promoForm.link_url}
                      onChange={(e) => setPromoForm({ ...promoForm, link_url: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5 font-bold text-slate-800 text-xs">
                    <label className="text-slate-500 uppercase">Status do Banner</label>
                    <div className="flex items-center gap-2 pt-2.5">
                      <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-[11px] text-slate-700 hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={promoForm.active}
                          onChange={(e) => setPromoForm({ ...promoForm, active: e.target.checked })}
                          className="w-4 h-4 text-slate-900 accent-slate-950 border-2 border-slate-950 rounded focus:ring-0 cursor-pointer"
                        />
                        <span>Banner Ativo e Visível no Site</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* PT Banner Image Upload */}
                  <div className="space-y-2 font-bold text-slate-800 text-xs">
                    <label className="text-slate-500 uppercase">Imagem do Banner (PT) *</label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        required
                        value={promoForm.image_url}
                        onChange={(e) => setPromoForm({ ...promoForm, image_url: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-amber-500 text-[10px] font-mono"
                        placeholder="Link da imagem ou faça o upload abaixo"
                      />
                      <label className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBannerImageUpload(e, "pt")}
                          className="hidden"
                        />
                        <span className="text-[10px] font-bold text-slate-600">Fazer Upload de Imagem (PT)</span>
                        <span className="text-[8px] text-slate-400">Conversão automática para WebP</span>
                      </label>
                    </div>
                  </div>

                  {/* ES Banner Image Upload */}
                  <div className="space-y-2 font-bold text-slate-800 text-xs">
                    <label className="text-slate-500 uppercase">Imagem do Banner (ES) - Opcional</label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={promoForm.image_url_es}
                        onChange={(e) => setPromoForm({ ...promoForm, image_url_es: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-amber-500 text-[10px] font-mono"
                        placeholder="Link da imagem ou faça o upload abaixo (se vazio, usa a imagem PT)"
                      />
                      <label className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBannerImageUpload(e, "es")}
                          className="hidden"
                        />
                        <span className="text-[10px] font-bold text-slate-600">Fazer Upload de Imagem (ES)</span>
                        <span className="text-[8px] text-slate-400">Conversão automática para WebP</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingPromoId(null)}
                    className="px-5 py-2.5 border-2 border-slate-950 hover:bg-slate-50 rounded-xl font-bold cursor-pointer transition-colors uppercase tracking-wider text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-bold border-2 border-slate-950 shadow-[3px_3px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider text-xs"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
