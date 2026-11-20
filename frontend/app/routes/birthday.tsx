import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("День рождения"); }
export default function Birthday() { return <PagePlaceholder title="День рождения" />; }
