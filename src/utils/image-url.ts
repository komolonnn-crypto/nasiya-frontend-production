const urlImage = import.meta.env["VITE_SERVER_URL"] as string;

export function ImageUrl(url: string) {
  return urlImage + url;
}
