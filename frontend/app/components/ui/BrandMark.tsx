export function BrandMark({ onPaper = false }: { onPaper?: boolean }) {
  return (
    <img
      className="brand-logo"
      src={onPaper ? "/images/studio/logo.png" : "/images/studio/logo1.png"}
      width={onPaper ? 540 : 600}
      height={onPaper ? 171 : 185}
      alt="Логотип кулинарной студии TIBON"
    />
  );
}
