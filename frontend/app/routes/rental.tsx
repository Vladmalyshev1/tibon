import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Аренда студии"); }
export default function Rental() { return <PagePlaceholder title="Аренда студии" />; }
