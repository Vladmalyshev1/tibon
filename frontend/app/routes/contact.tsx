import { PagePlaceholder } from "../components/ui/PagePlaceholder";
import { placeholderMeta } from "../lib/pageMeta";

export function meta() { return placeholderMeta("Контакты"); }
export default function Contact() { return <PagePlaceholder title="Контакты" />; }
