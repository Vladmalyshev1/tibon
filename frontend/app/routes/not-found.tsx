
export function loader() {
  throw new Response("Not Found", { status: 404 });
}

export function meta() {
  return [
    { title: "Страница не найдена — TIBON" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function NotFound() {
  return null;
}
