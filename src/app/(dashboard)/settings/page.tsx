import { Card, CardContent, PageHeader } from "@/ui/components";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Halaman placeholder untuk konfigurasi berikutnya"
      />
      <Card>
        <CardContent>
          <p className="text-sm text-slate-600">
            Belum ada pengaturan tambahan pada tahap ini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
