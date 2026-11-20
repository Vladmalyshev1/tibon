import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Политика обработки персональных данных"); }
export default function Privacy() { return <PagePlaceholder title="Политика обработки персональных данных" />; }
