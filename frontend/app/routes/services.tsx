import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Дополнительные услуги"); }
export default function Services() { return <PagePlaceholder title="Дополнительные услуги" />; }
