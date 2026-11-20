import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Корпоративы"); }
export default function Corporate() { return <PagePlaceholder title="Корпоративы" />; }
