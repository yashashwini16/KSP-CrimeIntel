import CaseDetailClient from "./CaseDetailClient";

export async function generateStaticParams() {
  return Array.from({ length: 150 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}

export default function CaseDetailPage() {
  return <CaseDetailClient />;
}
