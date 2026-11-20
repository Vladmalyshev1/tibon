import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Для взрослых"); }
export default function Adults() { return <PagePlaceholder title="Для взрослых" />; }
