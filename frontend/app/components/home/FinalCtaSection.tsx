import { ButtonLink } from "../ui/Button";

export function FinalCtaSection() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="container-default final-cta-grid">
        <div><p className="type-overline">Ваш повод</p><h2 id="final-cta-title" className="type-h2">Давайте обсудим событие за вашим столом</h2></div>
        <div className="final-cta-action"><p>Начните с повода и выберите, что вам хочется приготовить вместе.</p><ButtonLink to="/zayavka/" size="lg">Оставить заявку</ButtonLink></div>
      </div>
    </section>
  );
}
