import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Галерея"); }
export default function Gallery() { return <PagePlaceholder title="Галерея" />; }
