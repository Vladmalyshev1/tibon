import { studioContact } from "../../data/business";
import { LineIcon } from "./LineIcon";

export function StudioPhones({ className, linkClassName, showIcons = true }: {
  className?: string;
  linkClassName?: string;
  showIcons?: boolean;
}) {
  return (
    <span className={className ? `studio-phones ${className}` : "studio-phones"}>
      {studioContact.phones.map(({ href, label }) => (
        <a key={href} href={href} className={linkClassName}>
          {showIcons ? <LineIcon name="phone" /> : null}
          <span>{label}</span>
        </a>
      ))}
    </span>
  );
}
