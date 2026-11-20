import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Правила студии"); }
export default function Rules() { return <PagePlaceholder title="Правила студии" />; }
