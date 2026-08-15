import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ResourceActions } from "@/components/resources/ResourceActions";
import { Badge } from "@/components/ui/Badge";
import { fetchResourceBySlug } from "@/lib/data/resources";
import { isLang, localizedHref, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";
import { AGE_GROUP_LABELS, CATEGORY_LABELS } from "@/lib/types/api";

interface ResourceDetailPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: ResourceDetailPageProps): Promise<Metadata> {
  const { lang: langParam, slug } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const resource = await fetchResourceBySlug(slug).catch(() => null);
  if (!resource) {
    return { title: "Materi tidak ditemukan" };
  }
  return buildMetadata({
    lang,
    path: `/resources/${resource.slug}`,
    titleId: resource.title,
    descriptionId: resource.description,
    ogImage: resource.thumbnailUrl,
  });
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1_000)} KB`;
}

export default async function ResourceDetailPage({
  params,
}: ResourceDetailPageProps) {
  const { lang: langParam, slug } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const resource = await fetchResourceBySlug(slug).catch(() => null);

  if (!resource) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href={localizedHref(lang, "/resources")} className="hover:text-emerald-700">
          {lang === "en" ? "Downloads" : "Materi & Unduhan"}
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{resource.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
          <Image
            src={resource.thumbnailUrl}
            alt={`Thumbnail ${resource.title}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            <Badge tone="amber">
              {CATEGORY_LABELS[resource.category.slug] ??
                resource.category.name}
            </Badge>
            <Badge tone="emerald">{AGE_GROUP_LABELS[resource.ageGroup]}</Badge>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
            {resource.title}
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            {resource.description}
          </p>

          <dl className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">
                {lang === "en" ? "File name" : "Nama file"}
              </dt>
              <dd className="font-medium text-slate-800">
                {resource.fileName}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">
                {lang === "en" ? "Size" : "Ukuran"}
              </dt>
              <dd className="font-medium text-slate-800">
                {formatFileSize(resource.fileSize)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">
                {lang === "en" ? "Type" : "Jenis"}
              </dt>
              <dd className="font-medium text-slate-800">
                {resource.mimeType}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">
                {lang === "en" ? "Downloads" : "Diunduh"}
              </dt>
              <dd className="font-medium text-slate-800">
                {new Intl.NumberFormat("id-ID").format(
                  resource.downloadCount,
                )}{" "}
                {lang === "en" ? "times" : "kali"}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <ResourceActions resource={resource} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
