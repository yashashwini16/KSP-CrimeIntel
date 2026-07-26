import OffenderDetailClient from "./OffenderDetailClient";

export async function generateStaticParams() {
  return Array.from({ length: 150 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}

export default function OffenderDetailPage() {
  return <OffenderDetailClient />;
}
