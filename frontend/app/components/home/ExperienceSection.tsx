import { experiences } from "../../data/home";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "./Reveal";

export function ExperienceSection() {
  return (
    <section className="home-section experience-section" aria-labelledby="experience-title">
      <div className="container-default">
        <Reveal><SectionHeading id="experience-title" title="Больше, чем рецепт" overline="Впечатление" /></Reveal>
        <div className="experience-grid">
          {experiences.map((item, index) => (
            <Reveal key={item.number} delay={index * 0.06} className="experience-card">
              <h3 className="type-h3">{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
