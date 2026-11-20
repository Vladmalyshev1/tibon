import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Для детей"); }
export default function Children() { return <PagePlaceholder title="Для детей" />; }
