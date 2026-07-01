"use client";

import React, { useState, useEffect } from "react";
import { useDB, Product } from "@/context/DBContext";
import { parseVideoUrl, isValidVideoUrl, ProductVideo } from "@/lib/videoUtils";
import { ArrowLeft, Save, Sparkles, AlertTriangle, Upload, Move, Check, Play, Film, Trash2, Crop } from "lucide-react";
import { useRouter } from "next/navigation";
import ImageEditorModal from "./ImageEditorModal";

interface ProductFormProps {
  isEditing?: boolean;
  initialData?: Product | null;
}

export default function ProductForm({ isEditing = false, initialData = null }: ProductFormProps) {
  const { categories, addProduct, editProduct } = useDB();
  const router = useRouter();

  // Upload state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Image Editor States
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImageSrc, setEditorImageSrc] = useState("");
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);

  // Form State
  const [formState, setFormState] = useState({
    name_pt: "",
    name_es: "",
    slug: "",
    description_pt: "",
    description_es: "",
    price: 0,
    promo_price: "",
    category_id: "cat-1",
    stock: 10,
    min_stock: 5,
    dimensions: "65cm x 65cm x 110cm",
    material_pt: "Madeira e Metal",
    material_es: "Madera y Metal",
    warranty_pt: "1 ano",
    warranty_es: "1 año",
    delivery_time_pt: "3 a 5 dias úteis",
    delivery_time_es: "3 a 5 días hábiles",
    seo_title_pt: "",
    seo_title_es: "",
    seo_description_pt: "",
    seo_description_es: "",
    is_featured: false,
    brand: "",
    model: "",
    sku: "",
    video_url: "",
    videos: [] as ProductVideo[],
    countdown_end: "",
    badges: [] as string[]
  });

  useEffect(() => {
    if (isEditing && initialData) {
      setUploadedImages(initialData.images || []);
      setFormState({
        name_pt: initialData.name_pt || "",
        name_es: initialData.name_es || "",
        slug: initialData.slug || "",
        description_pt: initialData.description_pt || "",
        description_es: initialData.description_es || "",
        price: initialData.price || 0,
        promo_price: initialData.promo_price ? String(initialData.promo_price) : "",
        category_id: initialData.category_id || "cat-1",
        stock: initialData.stock || 0,
        min_stock: initialData.min_stock || 0,
        dimensions: initialData.dimensions || "",
        material_pt: initialData.material_pt || "",
        material_es: initialData.material_es || "",
        warranty_pt: initialData.warranty_pt || "",
        warranty_es: initialData.warranty_es || "",
        delivery_time_pt: initialData.delivery_time_pt || "",
        delivery_time_es: initialData.delivery_time_es || "",
        seo_title_pt: initialData.seo_title_pt || "",
        seo_title_es: initialData.seo_title_es || "",
        seo_description_pt: initialData.seo_description_pt || "",
        seo_description_es: initialData.seo_description_es || "",
        is_featured: initialData.is_featured || false,
        brand: initialData.brand || "",
        model: initialData.model || "",
        sku: initialData.sku || "",
        video_url: initialData.video_url || "",
        videos: initialData.videos || [],
        countdown_end: initialData.countdown_end || "",
        badges: initialData.badges || []
      });
    }
  }, [isEditing, initialData]);

  const generateSlug = () => {
    if (!formState.name_pt) return;
    const computed = formState.name_pt
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormState((prev) => ({ ...prev, slug: computed }));
  };

  const handleGenerateAIDescription = (lang: "pt" | "es") => {
    const name = lang === "pt" ? formState.name_pt : formState.name_es;
    if (!name.trim()) {
      alert(lang === "pt" ? "Por favor, digite o nome do produto primeiro!" : "¡Por favor, escriba el nombre del producto primero!");
      return;
    }
    
    let description = "";
    const category = categories.find(c => c.id === formState.category_id);
    const categoryName = category ? (lang === "pt" ? category.name_pt : category.name_es) : "";

    if (lang === "pt") {
      description = `Apresentamos o(a) ${name}, projetado(a) especialmente para o segmento de ${categoryName}. Feito com materiais premium de alta qualidade e estrutura robusta, este produto garante máximo conforto, durabilidade excepcional e um design elegante para transformar qualquer ambiente profissional ou residencial. Ideal para compras corporativas ou residenciais no Paraguai.`;
    } else {
      description = `Presentamos el/la ${name}, diseñado(a) especialmente para el segmento de ${categoryName}. Fabricado con materiales premium de alta calidad y una estructura robusta, este producto garantiza el máximo confort, durabilidad excepcional y un diseño elegante para transformar cualquier ambiente profesional o residencial. Ideal para compras corporativas o residenciales en Paraguay.`;
    }
    
    if (lang === "pt") {
      setFormState(prev => ({ ...prev, description_pt: description }));
    } else {
      setFormState(prev => ({ ...prev, description_es: description }));
    }
  };

  const compressAndConvertToWebP = (file: File, isMain: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const targetMaxSize = isMain ? 500 * 1024 : 300 * 1024;
          let quality = 0.85;
          let dataUrl = canvas.toDataURL("image/webp", quality);

          while (dataUrl.length * 0.75 > targetMaxSize && quality > 0.25) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL("image/webp", quality);
          }

          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Erro ao carregar a imagem."));
      };
      reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (uploadedImages.length + files.length > 7) {
      alert("Limite máximo de 7 imagens por produto atingido!");
      return;
    }

    setUploading(true);
    const readers: Promise<string>[] = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((base64Strings) => {
        setUploadQueue(base64Strings);
        setEditorImageSrc(base64Strings[0]);
        setEditingImageIndex(null);
        setEditorOpen(true);
      })
      .catch((err) => {
        alert("Erro no upload das imagens: " + err.message);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleEditExistingImage = (index: number) => {
    setEditingImageIndex(index);
    setEditorImageSrc(uploadedImages[index]);
    setEditorOpen(true);
  };

  const handleEditorSave = (editedBase64: string) => {
    if (editingImageIndex !== null) {
      const updated = [...uploadedImages];
      updated[editingImageIndex] = editedBase64;
      setUploadedImages(updated);
      setEditorOpen(false);
      setEditingImageIndex(null);
    } else {
      setUploadedImages((prev) => [...prev, editedBase64]);
      const nextQueue = uploadQueue.slice(1);
      setUploadQueue(nextQueue);
      if (nextQueue.length > 0) {
        setEditorImageSrc(nextQueue[0]);
      } else {
        setEditorOpen(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const setAsMainImage = (index: number) => {
    const reordered = [...uploadedImages];
    const target = reordered[index];
    reordered.splice(index, 1);
    reordered.unshift(target);
    setUploadedImages(reordered);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const reordered = [...uploadedImages];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    setUploadedImages(reordered);
    setDraggedIndex(null);
  };

  const handleBadgeToggle = (badge: string) => {
    const current = [...formState.badges];
    if (current.includes(badge)) {
      setFormState({ ...formState, badges: current.filter((b) => b !== badge) });
    } else {
      setFormState({ ...formState, badges: [...current, badge] });
    }
  };

  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoIsMain, setNewVideoIsMain] = useState(false);
  const [newVideoShowInGallery, setNewVideoShowInGallery] = useState(true);

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;
    if (!isValidVideoUrl(newVideoUrl)) {
      alert("Por favor, insira uma URL válida do YouTube, Vimeo ou Cloudflare Stream.");
      return;
    }
    const newVideo: ProductVideo = {
      id: "vid-" + Date.now(),
      url: newVideoUrl.trim(),
      title: newVideoTitle.trim() || `Vídeo ${formState.videos.length + 1}`,
      is_main: newVideoIsMain,
      show_in_gallery: newVideoShowInGallery
    };
    let updatedVideos = [...formState.videos];
    if (newVideoIsMain) {
      updatedVideos = updatedVideos.map(v => ({ ...v, is_main: false }));
    }
    if (updatedVideos.length === 0) {
      newVideo.is_main = true;
    }
    setFormState({ ...formState, videos: [...updatedVideos, newVideo] });
    setNewVideoUrl("");
    setNewVideoTitle("");
    setNewVideoIsMain(false);
    setNewVideoShowInGallery(true);
  };

  const handleToggleVideoMain = (id: string) => {
    const updated = formState.videos.map((v) => ({ ...v, is_main: v.id === id }));
    setFormState({ ...formState, videos: updated });
  };

  const handleToggleVideoGallery = (id: string) => {
    const updated = formState.videos.map((v) => {
      if (v.id === id) {
        return { ...v, show_in_gallery: !v.show_in_gallery };
      }
      return v;
    });
    setFormState({ ...formState, videos: updated });
  };

  const handleDeleteVideo = (id: string) => {
    const filtered = formState.videos.filter((v) => v.id !== id);
    if (filtered.length > 0 && !filtered.some(v => v.is_main)) {
      filtered[0].is_main = true;
    }
    setFormState({ ...formState, videos: filtered });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      alert("Adicione pelo menos uma imagem para o produto!");
      return;
    }
    const formattedPayload = {
      name_pt: formState.name_pt,
      name_es: formState.name_es,
      slug: formState.slug || "produto-" + Date.now(),
      description_pt: formState.description_pt,
      description_es: formState.description_es,
      price: Number(formState.price),
      promo_price: formState.promo_price ? Number(formState.promo_price) : undefined,
      category_id: formState.category_id,
      images: uploadedImages,
      stock: Number(formState.stock),
      min_stock: Number(formState.min_stock),
      dimensions: formState.dimensions,
      material_pt: formState.material_pt,
      material_es: formState.material_es,
      warranty_pt: formState.warranty_pt,
      warranty_es: formState.warranty_es,
      delivery_time_pt: formState.delivery_time_pt,
      delivery_time_es: formState.delivery_time_es,
      seo_title_pt: formState.seo_title_pt,
      seo_title_es: formState.seo_title_es,
      seo_description_pt: formState.seo_description_pt,
      seo_description_es: formState.seo_description_es,
      is_featured: formState.is_featured,
      brand: formState.brand,
      model: formState.model,
      sku: formState.sku,
      video_url: formState.video_url,
      videos: formState.videos,
      countdown_end: formState.countdown_end || undefined,
      badges: formState.badges
    };

    if (isEditing && initialData) {
      editProduct(initialData.id, formattedPayload);
    } else {
      addProduct(formattedPayload);
    }
    router.push("/admin/products");
  };

  const formatSize = (base64Str: string) => {
    const bytes = base64Str.length * 0.75;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <form onSubmit={handleSave} className="bg-white border-2 border-slate-950 rounded-xl p-6 sm:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-6 text-slate-950 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="p-2 hover:bg-slate-100 rounded-full border-2 border-slate-950 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-base font-black text-slate-950 uppercase tracking-tight">
          {isEditing ? "Editar Detalhes do Produto" : "Cadastrar Novo Produto"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Informações Básicas */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-accent-amber" />
              <span>Informações Básicas</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase">Nome (Português) *</label>
                <input
                  type="text"
                  required
                  value={formState.name_pt}
                  onChange={(e) => setFormState({ ...formState, name_pt: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  placeholder="Ex: Smart TV 55 QLED"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase">Nombre (Español) *</label>
                <input
                  type="text"
                  required
                  value={formState.name_es}
                  onChange={(e) => setFormState({ ...formState, name_es: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  placeholder="Ex: Smart TV 55 QLED"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase">Marca</label>
                <input
                  type="text"
                  value={formState.brand}
                  onChange={(e) => setFormState({ ...formState, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-355 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  placeholder="Ex: Samsung"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase">Modelo</label>
                <input
                  type="text"
                  value={formState.model}
                  onChange={(e) => setFormState({ ...formState, model: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-355 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  placeholder="Ex: QN55Q60D"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase">SKU</label>
                <input
                  type="text"
                  value={formState.sku}
                  onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-355 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  placeholder="Ex: SAM-Q55"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase">Categoria *</label>
                <select
                  value={formState.category_id}
                  onChange={(e) => setFormState({ ...formState, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-355 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_pt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase">Link URL (Slug) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formState.slug}
                    onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-355 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                    placeholder="smart-tv-55-qled"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold cursor-pointer transition-colors"
                  >
                    Gerar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grids for Price and Stock side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card: Preços */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <span>💰 Preços</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Preço Base (Gs.) *</label>
                  <input
                    type="number"
                    required
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Preço Promo (Gs.)</label>
                  <input
                    type="number"
                    value={formState.promo_price}
                    onChange={(e) => setFormState({ ...formState, promo_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            {/* Card: Estoque */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <span>📦 Estoque</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Estoque Disponível *</label>
                  <input
                    type="number"
                    required
                    value={formState.stock}
                    onChange={(e) => setFormState({ ...formState, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Estoque Mínimo *</label>
                  <input
                    type="number"
                    required
                    value={formState.min_stock}
                    onChange={(e) => setFormState({ ...formState, min_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Especificações */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <span>📐 Especificações</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna Esquerda */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Dimensões *</label>
                  <input
                    type="text"
                    required
                    value={formState.dimensions}
                    onChange={(e) => setFormState({ ...formState, dimensions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Garantia (PT) *</label>
                  <input
                    type="text"
                    required
                    value={formState.warranty_pt}
                    onChange={(e) => setFormState({ ...formState, warranty_pt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Material (PT) *</label>
                  <input
                    type="text"
                    required
                    value={formState.material_pt}
                    onChange={(e) => setFormState({ ...formState, material_pt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  />
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Material (ES) *</label>
                  <input
                    type="text"
                    required
                    value={formState.material_es}
                    onChange={(e) => setFormState({ ...formState, material_es: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Garantia (ES) *</label>
                  <input
                    type="text"
                    required
                    value={formState.warranty_es}
                    onChange={(e) => setFormState({ ...formState, warranty_es: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase">Prazo de Entrega (PT) *</label>
                  <input
                    type="text"
                    required
                    value={formState.delivery_time_pt}
                    onChange={(e) => setFormState({ ...formState, delivery_time_pt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Descrições */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <span>📝 Descrições</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-500 uppercase">Descrição (PT) *</label>
                  <button
                    type="button"
                    onClick={() => handleGenerateAIDescription("pt")}
                    className="flex items-center gap-1 text-[10px] text-accent-amber hover:underline font-bold uppercase cursor-pointer bg-transparent border-none"
                  >
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>Gerar com IA</span>
                  </button>
                </div>
                <textarea
                  required
                  value={formState.description_pt}
                  onChange={(e) => setFormState({ ...formState, description_pt: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-bold bg-slate-50/50 focus:outline-none focus:border-accent-amber"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-500 uppercase">Descripción (ES) *</label>
                  <button
                    type="button"
                    onClick={() => handleGenerateAIDescription("es")}
                    className="flex items-center gap-1 text-[10px] text-accent-amber hover:underline font-bold uppercase cursor-pointer bg-transparent border-none"
                  >
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>Generar con IA</span>
                  </button>
                </div>
                <textarea
                  required
                  value={formState.description_es}
                  onChange={(e) => setFormState({ ...formState, description_es: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-bold bg-slate-50/50 focus:outline-none focus:border-accent-amber"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Fotos */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <span>📷 Fotos</span>
            </h3>

            <div className="space-y-4">
              <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all hover:bg-slate-50/60 ${uploading ? "opacity-60 pointer-events-none" : "border-slate-300 hover:border-slate-400"}`}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-slate-400" />
                <div className="font-bold text-slate-800 text-sm">
                  {uploading ? "Processando imagens..." : "Clique ou Arraste fotos aqui"}
                </div>
                <div className="text-[10px] text-slate-400 leading-normal max-w-[280px]">
                  Conversão automática para WebP.<br />
                  Max: Principal 500 KB / Galeria 300 KB.<br />
                  Formatos aceitos: JPG, PNG, WEBP, SVG.
                </div>
              </label>

              {uploadedImages.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Galeria ({uploadedImages.length} de 7) — Arraste para reordenar
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {uploadedImages.map((img, index) => {
                      const isMain = index === 0;
                      return (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={() => handleDrop(index)}
                          className={`flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg transition-all ${
                            isMain
                              ? "border-slate-950 bg-amber-50/45 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                              : "border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className="cursor-grab text-slate-400 hover:text-slate-600 px-1">
                            <Move className="w-4 h-4" />
                          </div>
                          <div className="w-12 h-12 bg-white rounded border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                            <img src={img} alt="preview" className="max-h-full max-w-full object-contain" loading="lazy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wide ${
                                isMain ? "bg-slate-950 text-white" : "bg-slate-200 text-slate-600"
                              }`}>
                                {isMain ? "Principal" : `Foto ${index + 1}`}
                              </span>
                              {img.startsWith("data:") && (
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {formatSize(img)}
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate mt-0.5">
                              {img.startsWith("data:") ? "WebP Compactada" : "SVG Local"}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditExistingImage(index)}
                              className="p-1 text-[10px] text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 rounded bg-white font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="Editar Imagem"
                            >
                              <Crop className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => setAsMainImage(index)}
                                className="p-1 text-[10px] text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 rounded bg-white font-bold transition-all cursor-pointer"
                                title="Tornar Foto Principal"
                              >
                                Principal
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1 text-xs text-red-500 hover:text-red-700 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Vídeos */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <span>🎥 Vídeos</span>
            </h3>

            <div className="space-y-4">
              {formState.videos.length > 0 ? (
                <div className="space-y-3">
                  {formState.videos.map((vid) => {
                    const parsed = parseVideoUrl(vid.url);
                    return (
                      <div
                        key={vid.id}
                        className="flex flex-col items-stretch gap-2.5 p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center gap-3 w-full">
                          {parsed.thumbnail ? (
                            <div className="relative w-16 h-10 bg-slate-100 border border-slate-200 rounded overflow-hidden flex-shrink-0">
                              <img src={parsed.thumbnail} alt={vid.title} className="w-full h-full object-cover" loading="lazy" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Play className="w-4 h-4 text-white fill-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-10 bg-slate-100 border border-slate-200 rounded flex items-center justify-center flex-shrink-0">
                              <Film className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 text-slate-950">
                            <p className="font-bold text-xs truncate">{vid.title}</p>
                            <div className="flex gap-1.5 mt-1">
                              <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                {parsed.provider || "Desconhecido"}
                              </span>
                              {vid.is_main && (
                                <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded">Principal</span>
                              )}
                              {vid.show_in_gallery && (
                                <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 bg-slate-900 text-white rounded">Na Galeria</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-2 gap-2 text-[10px]">
                          <div className="flex gap-3">
                            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-700">
                              <input
                                type="radio"
                                name={`mainVideoRadio-${vid.id}`}
                                checked={vid.is_main}
                                onChange={() => handleToggleVideoMain(vid.id)}
                                className="w-3.5 h-3.5 text-slate-900 accent-slate-950 focus:ring-0"
                              />
                              <span>Principal</span>
                            </label>

                            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-700">
                              <input
                                type="checkbox"
                                checked={vid.show_in_gallery}
                                onChange={() => handleToggleVideoGallery(vid.id)}
                                className="w-3.5 h-3.5 text-slate-900 accent-slate-950 rounded focus:ring-0"
                              />
                              <span>Galeria</span>
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 transition-colors cursor-pointer"
                            title="Excluir vídeo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">
                  Nenhum vídeo adicionado para este produto.
                </p>
              )}

              {formState.videos.length < 3 ? (
                <div className="mt-4 border-t border-dashed border-slate-300 pt-4 space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-950 uppercase">Adicionar Novo Vídeo</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Título</label>
                      <input
                        type="text"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        placeholder="Ex: Demonstração do Produto"
                        className="w-full px-3 py-1.5 text-xs border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-white font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">URL ou Link</label>
                      <input
                        type="text"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="YouTube, Vimeo..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-350 rounded focus:outline-none focus:border-accent-amber bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={newVideoIsMain}
                          onChange={(e) => setNewVideoIsMain(e.target.checked)}
                          className="w-4 h-4 text-slate-900 accent-slate-950 rounded focus:ring-0"
                        />
                        <span>Principal</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={newVideoShowInGallery}
                          onChange={(e) => setNewVideoShowInGallery(e.target.checked)}
                          className="w-4 h-4 text-slate-900 accent-slate-950 rounded focus:ring-0"
                        />
                        <span>Galeria</span>
                      </label>
                    </div>

                    {newVideoUrl && (
                      <div className="flex items-center gap-2 border border-slate-200 p-1.5 rounded bg-white max-w-full">
                        {(() => {
                          const parsed = parseVideoUrl(newVideoUrl);
                          if (parsed.provider && parsed.thumbnail) {
                            return (
                              <>
                                <img src={parsed.thumbnail} alt="Thumbnail Preview" className="w-12 h-8 object-cover rounded flex-shrink-0" loading="lazy" />
                                <div className="min-w-0">
                                  <p className="text-[9px] font-bold text-green-600 flex items-center gap-0.5">
                                    <Check className="w-3.5 h-3.5 text-green-600" /> Link Válido
                                  </p>
                                  <p className="text-[8px] text-slate-400 capitalize truncate font-mono">{parsed.provider} ID: {parsed.id}</p>
                                </div>
                              </>
                            );
                          } else {
                            return (
                              <div className="flex items-center gap-1.5 px-2 py-1">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-[9px] font-bold text-red-500">Link Inválido</span>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddVideo}
                      disabled={!isValidVideoUrl(newVideoUrl)}
                      className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white disabled:bg-slate-350 disabled:text-slate-500 font-bold text-xs rounded transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 rounded border border-amber-200 text-xs font-bold flex items-center gap-2 mt-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Limite máximo de 3 vídeos atingido.</span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Promoções */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <span>🏷️ Promoções</span>
            </h3>
            
            <div className="space-y-3">
              <label className="font-bold text-slate-500 uppercase block mb-1">Selecionar Selos do Produto</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "promo", label: "🏷️ Oferta" },
                  { id: "featured", label: "⭐ Destaque" },
                  { id: "bestseller", label: "🔥 Mais Vendido" },
                  { id: "free_shipping", label: "🚚 Frete Grátis" },
                  { id: "new", label: "✨ Novo" },
                  { id: "last_units", label: "⚠️ Últimas Unidades" }
                ].map((badge) => {
                  const isChecked = formState.badges.includes(badge.id);
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => handleBadgeToggle(badge.id)}
                      className={`flex items-center gap-1 px-1.5 py-2 border-2 rounded-lg font-bold text-left cursor-pointer transition-all ${
                        isChecked
                          ? "bg-slate-950 text-white border-slate-950 shadow-[1px_1px_0px_rgba(0,0,0,1)] font-bold text-[9px]"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-400 font-bold text-[9px]"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 text-[10px] ${isChecked ? "bg-accent-amber border-slate-950 text-slate-950 font-bold" : "bg-white border-slate-300 font-bold"}`}>
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      <span className="truncate">{badge.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card: Oferta Relâmpago */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <span>📅 Oferta Relâmpago</span>
            </h3>
            
            <div className="space-y-2">
              <label className="font-bold text-slate-500 uppercase text-[10px]">Data Limite (Countdown)</label>
              <input
                type="datetime-local"
                value={formState.countdown_end}
                onChange={(e) => setFormState({ ...formState, countdown_end: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
              />
              <p className="text-[10px] text-slate-400">Ativa o cronômetro regressivo na página inicial do site para este produto.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card: SEO & Metatags (Full Width) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4 mt-6">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
          <span>🔍 SEO & Metatags</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500 uppercase">SEO Title (PT)</label>
            <input
              type="text"
              value={formState.seo_title_pt}
              onChange={(e) => setFormState({ ...formState, seo_title_pt: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
              placeholder="Título otimizado para o Google"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500 uppercase">SEO Title (ES)</label>
            <input
              type="text"
              value={formState.seo_title_es}
              onChange={(e) => setFormState({ ...formState, seo_title_es: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
              placeholder="Título optimizado para Google"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500 uppercase">SEO Description (PT)</label>
            <textarea
              value={formState.seo_description_pt}
              onChange={(e) => setFormState({ ...formState, seo_description_pt: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
              placeholder="Descrição otimizada para o Google"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500 uppercase">SEO Description (ES)</label>
            <textarea
              value={formState.seo_description_es}
              onChange={(e) => setFormState({ ...formState, seo_description_es: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-accent-amber bg-slate-50/50 font-bold"
              placeholder="Descripción optimizada para Google"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="border-t-2 border-slate-950 pt-5 flex justify-end gap-3.5">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-2.5 border-2 border-slate-950 hover:bg-slate-100 rounded-lg font-bold cursor-pointer transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-lg font-bold border-2 border-slate-950 shadow-[3px_3px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      <ImageEditorModal
        isOpen={editorOpen}
        imageSrc={editorImageSrc}
        onSave={handleEditorSave}
        onClose={() => setEditorOpen(false)}
      />
    </form>
  );
}
