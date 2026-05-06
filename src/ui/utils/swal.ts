import Swal, { type SweetAlertIcon, type SweetAlertOptions } from "sweetalert2";

type ConfirmOptions = {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
};

function withBaseStyles(options: SweetAlertOptions): SweetAlertOptions {
  return {
    ...options,
    background: "#ffffff",
    color: "#0f172a",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-lg border border-slate-200 shadow-sm",
      title: "text-slate-900",
      htmlContainer: "text-slate-600",
      confirmButton:
        "rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
      cancelButton:
        "ml-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
      ...options.customClass,
    },
  };
}

export async function showSuccess(message: string) {
  await Swal.fire(
    withBaseStyles({
      icon: "success",
      title: "Berhasil",
      text: message,
      timer: 1600,
      timerProgressBar: true,
      showConfirmButton: false,
    }),
  );
}

export async function showError(message: string) {
  await Swal.fire(
    withBaseStyles({
      icon: "error",
      title: "Terjadi kesalahan",
      text: message,
      confirmButtonText: "Tutup",
    }),
  );
}

export async function showWarning(message: string) {
  await Swal.fire(
    withBaseStyles({
      icon: "warning",
      title: "Perhatian",
      text: message,
      confirmButtonText: "Mengerti",
    }),
  );
}

export async function confirmDelete(options?: ConfirmOptions) {
  const result = await Swal.fire(
    withBaseStyles({
      icon: options?.icon ?? "warning",
      title: options?.title ?? "Hapus data?",
      text: options?.text ?? "Data yang dihapus tidak bisa dikembalikan.",
      showCancelButton: true,
      confirmButtonText: options?.confirmButtonText ?? "Ya, hapus",
      cancelButtonText: options?.cancelButtonText ?? "Batal",
      focusCancel: true,
      reverseButtons: true,
    }),
  );

  return result.isConfirmed;
}

export async function confirmAction(options?: ConfirmOptions) {
  const result = await Swal.fire(
    withBaseStyles({
      icon: options?.icon ?? "warning",
      title: options?.title ?? "Lanjutkan aksi?",
      text: options?.text ?? "Pastikan aksi ini sudah sesuai.",
      showCancelButton: true,
      confirmButtonText: options?.confirmButtonText ?? "Ya, lanjutkan",
      cancelButtonText: options?.cancelButtonText ?? "Batal",
      focusCancel: true,
      reverseButtons: true,
    }),
  );

  return result.isConfirmed;
}
