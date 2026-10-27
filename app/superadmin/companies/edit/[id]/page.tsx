import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCompanyForm from "./edit-company-form";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const company = await prisma.company.findUnique({ where: { id: resolvedParams.id } });
  if (!company) notFound();
  return <EditCompanyForm company={company} />;
}