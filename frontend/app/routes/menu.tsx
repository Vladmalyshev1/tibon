import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Меню"); }
export default function Menu() { return <PagePlaceholder title="Меню" />; }
