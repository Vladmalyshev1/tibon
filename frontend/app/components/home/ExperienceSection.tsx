import { experiences } from "../../data/home";
import { SectionHeading } from "../ui/SectionHeading";

export function ExperienceSection() {
  return (
    <section className="home-section experience-section" aria-labelledby="experience-title">
      <div className="container-default experience-layout">
        <div><SectionHeading id="experience-title" title="Больше, чем рецепт" overline="Впечатление" /></div>
        <div className="experience-grid">
          {experiences.map((item) => (
            <div key={item.number} className="experience-card">
              <h3 className="type-h3">{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
