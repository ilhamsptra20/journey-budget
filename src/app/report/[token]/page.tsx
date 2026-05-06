import { PublicReportPageContent } from "./_components/PublicReportPageContent";

type PublicReportPageProps = {
  params: Promise<{ token: string }>;
};

export default async function PublicReportPage({ params }: PublicReportPageProps) {
  const { token } = await params;
  return <PublicReportPageContent token={token} />;
}
