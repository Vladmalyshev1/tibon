import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("О студии"); }
export default function Studio() { return <PagePlaceholder title="О студии" />; }
