import EditPageClient from "./EditPageClient";

export function generateStaticParams() {
  return [
    { id: "prod-1" },
    { id: "prod-2" },
    { id: "prod-3" },
    { id: "prod-4" },
    { id: "prod-5" },
    { id: "prod-6" },
    { id: "prod-7" },
    { id: "prod-app-1" },
    { id: "prod-app-2" },
    { id: "prod-app-3" },
  ];
}

export default function AdminProductEditPage() {
  return <EditPageClient />;
}
