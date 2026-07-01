export interface TranslationMap {
  [key: string]: {
    pt: string;
    es: string;
  };
}

export const defaultTranslations: TranslationMap = {
  // Navigation
  "nav.home": { pt: "Início", es: "Inicio" },
  "nav.products": { pt: "Móveis", es: "Muebles" },
  "nav.about": { pt: "Sobre Nós", es: "Sobre Nosotros" },
  "nav.contact": { pt: "Contato", es: "Contacto" },
  "nav.whatsapp": { pt: "Atendimento WhatsApp", es: "Atención WhatsApp" },
  "nav.admin": { pt: "Painel Admin", es: "Panel Admin" },
  "nav.cart": { pt: "Carrinho", es: "Carrito" },
  "nav.checkout": { pt: "Finalizar Pedido", es: "Finalizar Pedido" },
  "nav.promotions": { pt: "Promoções", es: "Promociones" },

  // Top Bar
  "topbar.delivery": { pt: "🚚 Frete GRÁTIS para Ciudad del Este e Minga Guazú | Atendimento em todo Alto Paraná", es: "🚚 ¡Envío GRATIS para Ciudad del Este y Minga Guazú! | Cobertura en todo Alto Paraná" },
  "topbar.support": { pt: "Atendimento via WhatsApp", es: "Atención vía WhatsApp" },
  "topbar.secure": { pt: "🔒 Compra 100% Segura", es: "🔒 Compra 100% Segura" },

  // Hero Section
  "hero.title": { pt: "Seu novo móvel sem complicação.", es: "Tu nuevo mueble sin complicaciones." },
  "hero.subtitle": { pt: "Móveis e cadeiras premium para casa e escritório com uma experiência de compra simples, rápida e transparente.", es: "Muebles y sillas premium para el hogar y la oficina con una experiencia de compra sencilla, rápida y transparente." },
  "hero.cta_products": { pt: "Ver Produtos", es: "Ver Productos" },
  "hero.cta_whatsapp": { pt: "Falar no WhatsApp", es: "Hablar por WhatsApp" },

  // Categories
  "category.all": { pt: "Todos os Produtos", es: "Todos los Productos" },
  "category.office_chairs": { pt: "Cadeiras de Escritório", es: "Sillas de Oficina" },
  "category.gamer_chairs": { pt: "Cadeiras Gamer", es: "Sillas Gamer" },
  "category.desks": { pt: "Mesas", es: "Mesas" },
  "category.home_office": { pt: "Home Office", es: "Home Office" },
  "category.bookshelves": { pt: "Estantes e Organizadores", es: "Estanterías y Organizadores" },
  "category.promotions": { pt: "Ofertas e Promoções", es: "Ofertas y Promociones" },

  // Homepage sections
  "home.featured_products": { pt: "Produtos em Destaque", es: "Productos Destacados" },
  "home.featured_subtitle": { pt: "Os mais procurados com preços especiais e entrega rápida.", es: "Los más buscados con precios especiales y entrega rápida." },
  "home.how_it_works": { pt: "Como Funciona", es: "Cómo Funciona" },
  "home.how_step1_title": { pt: "1. Escolha o produto", es: "1. Elige el producto" },
  "home.how_step1_desc": { pt: "Navegue pelo site e selecione o móvel ideal para você.", es: "Navega por la web y selecciona el mueble ideal para ti." },
  "home.how_step2_title": { pt: "2. Faça seu pedido", es: "2. Haz tu pedido" },
  "home.how_step2_desc": { pt: "Preencha seus dados de entrega em nossa página de checkout rápido.", es: "Completa tus datos de entrega en nuestra página de checkout rápido." },
  "home.how_step3_title": { pt: "3. Receba a confirmação", es: "3. Recibe la confirmación" },
  "home.how_step3_desc": { pt: "Nesta equipe entra em contato humano para combinar a entrega.", es: "Nuestro equipo se pone en contacto humano para coordinar la entrega." },
  "home.how_step4_title": { pt: "4. Receba seu móvel", es: "4. Recibe tu mueble" },
  "home.how_step4_desc": { pt: "Entregamos e montamos com o máximo de cuidado e segurança.", es: "Entregamos y montamos con el máximo cuidado y seguridad." },

  // FAQ
  "faq.title": { pt: "Dúvidas Frequentes", es: "Preguntas Frecuentes" },
  "faq.q1": { pt: "Como faço um pedido?", es: "¿Cómo hago un pedido?" },
  "faq.a1": { pt: "Escolha o produto no site, adicione ao carrinho e finalize pelo checkout ou finalize direto com nossos atendentes pelo WhatsApp.", es: "Elige el producto en la web, agrégalo al carrito y finaliza por el checkout o directamente con nuestros asesores por WhatsApp." },
  "faq.q2": { pt: "Quais regiões atendem?", es: "¿Qué regiones atienden?" },
  "faq.a2": { pt: "Atendemos todo o departamento de Alto Paraná (com frete grátis para Ciudad del Este e Minga Guazú), além de outras regiões do Paraguai sob consulta via WhatsApp.", es: "Atendemos a todo el departamento de Alto Paraná (con envío gratis para Ciudad del Este y Minga Guazú), además de otras regiones de Paraguay bajo consulta vía WhatsApp." },
  "faq.q3": { pt: "Quanto tempo demora a entrega?", es: "¿Cuánto tempo demora la entrega?" },
  "faq.a3": { pt: "O prazo de entrega varia por produto e região (geralmente de 2 a 5 dias úteis). O prazo exato é informado na página de cada produto.", es: "El tiempo de entrega varía según el producto y la región (generalmente de 2 a 5 días hábiles). El plazo exacto se informa en la página de cada producto." },
  "faq.q4": { pt: "Posso acompanhar meu pedido?", es: "¿Puedo realizar el seguimiento de mi pedido?" },
  "faq.a4": { pt: "Sim. Você receberá atualizações constantes de status do pedido via WhatsApp ou e-mail conforme ele for processado e enviado.", es: "Sí. Recibirás actualizaciones constantes del estado del pedido por WhatsApp o correo electrónico a medida que se procese y envíe." },
  "faq.q5": { pt: "Como falar com o atendimento?", es: "¿Cómo hablar con atención al cliente?" },
  "faq.a5": { pt: "Você pode nos chamar diretamente pelo ícone flutuante do WhatsApp ou preencher o formulário de contato em nosso rodapé.", es: "Puedes llamarnos directamente a través del ícono flotante de WhatsApp o completar el formulario de contacto en nuestro pie de página." },
  "faq.q6": { pt: "Como funciona o pagamento?", es: "¿Cómo funciona el pago?" },
  "faq.a6": { pt: "O pagamento é realizado somente no momento da entrega. Você não paga nada antecipado — escolha o produto, confirme o pedido e pague quando receber em mãos. Aceitamos dinheiro, cartão e transferência.", es: "El pago se realiza únicamente al momento de la entrega. No pagas nada por adelantado — elige el producto, confirma el pedido y paga cuando lo recibas. Aceptamos efectivo, tarjeta y transferencia." },
  "faq.q7": { pt: "O site é seguro?", es: "¿El sitio es seguro?" },
  "faq.a7": { pt: "Totalmente. Utilizamos criptografia SSL segura e não armazenamos dados de cartões de crédito. Seus dados cadastrais estão 100% protegidos.", es: "Totalmente. Utilizados encriptación SSL segura y no guardamos datos de tarjetas de crédito. Sus datos de registro están 100% protegidos." },

  // CTA final
  "home.cta_final_title": { pt: "Encontrou o que procura?", es: "¿Encontraste lo que buscas?" },
  "home.cta_final_desc": { pt: "Escolha seus produtos e faça seu pedido em poucos minutos com total comodidade.", es: "Elige tus productos y realiza tu pedido en pocos minutos con total comodidad." },

  // Product Page
  "product.specs": { pt: "Especificações Técnicas", es: "Especificaciones Técnicas" },
  "product.dimensions": { pt: "Medidas", es: "Medidas" },
  "product.material": { pt: "Material", es: "Material" },
  "product.warranty": { pt: "Garantia", es: "Garantía" },
  "product.delivery_estimate": { pt: "Prazo de Entrega", es: "Prazo de Entrega" },
  "product.availability": { pt: "Disponibilidade", es: "Disponibilidad" },
  "product.in_stock": { pt: "Em Estoque", es: "En Stock" },
  "product.out_of_stock": { pt: "Indisponível", es: "Agotado" },
  "product.button_buy": { pt: "Comprar Agora", es: "Comprar Ahora" },
  "product.button_quote": { pt: "Solicitar Orçamento", es: "Solicitar Presupuesto" },
  "product.button_whatsapp": { pt: "Comprar via WhatsApp", es: "Comprar por WhatsApp" },
  "product.related": { pt: "Produtos Relacionados", es: "Productos Relacionados" },
  "product.saving": { pt: "Economia de", es: "Ahorro de" },

  // Cart
  "cart.title": { pt: "Seu Carrinho", es: "Tu Carrito" },
  "cart.empty": { pt: "Seu carrinho está vazio.", es: "Tu carrito está vacío." },
  "cart.summary": { pt: "Resumo do Pedido", es: "Resumen del Pedido" },
  "cart.subtotal": { pt: "Subtotal", es: "Subtotal" },
  "cart.shipping": { pt: "Frete", es: "Envío" },
  "cart.shipping_info": { pt: "A ser combinado com o vendedor", es: "A acordar con el vendedor" },
  "cart.total": { pt: "Total", es: "Total" },
  "cart.checkout_btn": { pt: "Finalizar Compra", es: "Finalizar Compra" },
  "cart.continue_shopping": { pt: "Continuar Comprando", es: "Continuar Comprando" },
  "cart.coupon_placeholder": { pt: "Cupom de desconto", es: "Cupón de descuento" },
  "cart.coupon_apply": { pt: "Aplicar", es: "Aplicar" },

  // Checkout
  "checkout.title": { pt: "Checkout de Compra", es: "Checkout de Compra" },
  "checkout.personal_info": { pt: "Informações Pessoais", es: "Información Personal" },
  "checkout.delivery_info": { pt: "Informações de Entrega", es: "Información de Entrega" },
  "checkout.name": { pt: "Nome Completo", es: "Nombre Completo" },
  "checkout.phone": { pt: "Telefone / WhatsApp", es: "Teléfono / WhatsApp" },
  "checkout.email": { pt: "E-mail", es: "Correo electrónico" },
  "checkout.city": { pt: "Cidade", es: "Ciudad" },
  "checkout.address": { pt: "Endereço Completo", es: "Dirección Completa" },
  "checkout.notes": { pt: "Observações do Pedido (Ex: Horário de preferência)", es: "Observaciones del Pedido (Ej: Horario de preferencia)" },
  "checkout.place_order": { pt: "Finalizar Pedido pelo Site", es: "Finalizar Pedido por la Web" },
  "checkout.place_whatsapp": { pt: "Finalizar e Enviar via WhatsApp", es: "Finalizar y Enviar por WhatsApp" },
  "checkout.quote_btn": { pt: "Solicitar Orçamento Formal", es: "Solicitar Presupuesto Formal" },
  "checkout.secure_note": { pt: "Seus dados estão protegidos por criptografia de ponta a ponta.", es: "Sus datos están protegidos por encriptación de extremo a extremo." },
  "checkout.success_title": { pt: "Pedido Realizado com Sucesso!", es: "¡Pedido Realizado con Éxito!" },
  "checkout.success_desc": { pt: "Obrigado pelo seu pedido. Clique no botão abaixo para nos chamar no WhatsApp e agilizar o envio, ou aguarde o contato da nossa equipe.", es: "Gracias por su pedido. Haga clic en el botón de abajo para llamarnos por WhatsApp y agilizar el envío, o espere el contacto de nuestro equipo." },
  "checkout.whatsapp_redirect": { pt: "Confirmar no WhatsApp Agora", es: "Confirmar en WhatsApp Ahora" }
};
