import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Романтический ужин"); }
export default function RomanticDinner() { return <PagePlaceholder title="Романтический ужин" />; }
