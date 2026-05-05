import { TripDetailContent } from "./_components/TripDetailContent";

type TripDetailPageProps = {
  params: Promise<{ tripId: string }>;
};

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = await params;
  return <TripDetailContent tripId={tripId} />;
}
