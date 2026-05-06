import type { Metadata } from "next";

import { PublicReportPageContent } from "./_components/PublicReportPageContent";

type PublicReportPageProps = {
  params: Promise<{ token: string }>;
};

type PublicReportMetaData = {
  trip: {
    title: string;
    location: string;
    start_date: string;
    end_date: string | null;
  };
};

type ApiEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

function getBaseUrl() {
  const fromPublic = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromPublic) {
    return fromPublic;
  }

  const fromVercel = process.env.VERCEL_URL?.trim();
  if (fromVercel) {
    return `https://${fromVercel}`;
  }

  return "http://localhost:3000";
}

function formatMetaDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildTripDateLabel(startDate: string, endDate: string | null) {
  const formattedStart = formatMetaDate(startDate);
  const formattedEnd = formatMetaDate(endDate);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }

  return formattedStart ?? formattedEnd;
}

async function getPublicReportForMetadata(token: string): Promise<PublicReportMetaData | null> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/public/reports/${token}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiEnvelope<PublicReportMetaData>;
    if (!payload.status) {
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PublicReportPageProps): Promise<Metadata> {
  const { token } = await params;
  const report = await getPublicReportForMetadata(token);

  if (!report) {
    return {
      title: "Public Report Tidak Tersedia",
      description: "Link report mungkin salah, sudah dinonaktifkan, atau belum dibagikan.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const tripTitle = report.trip.title;
  const tripLocation = report.trip.location;
  const tripDate = buildTripDateLabel(report.trip.start_date, report.trip.end_date);
  const path = `/report/${token}`;

  const descriptionParts = [
    `Ringkasan publik untuk trip ${tripTitle}`,
    tripLocation || null,
    tripDate || null,
  ].filter(Boolean);
  const description = descriptionParts.join(" • ");
  const pageTitle = `${tripTitle} | Public Trip Report`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      url: path,
      title: pageTitle,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `Public report trip ${tripTitle}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: ["/twitter-image"],
    },
  };
}

export default async function PublicReportPage({ params }: PublicReportPageProps) {
  const { token } = await params;
  return <PublicReportPageContent token={token} />;
}
