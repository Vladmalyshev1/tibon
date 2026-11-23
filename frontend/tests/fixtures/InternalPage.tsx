import { FAQSection } from "../../app/components/pages/FAQSection";
import { FeatureGrid } from "../../app/components/pages/FeatureGrid";
import { ImageTextSection } from "../../app/components/pages/ImageTextSection";
import { PageCTA } from "../../app/components/pages/PageCTA";
import { PageGallery } from "../../app/components/pages/PageGallery";
import { PageHero } from "../../app/components/pages/PageHero";
import { PageSection } from "../../app/components/pages/PageSection";
import { ServiceCard } from "../../app/components/pages/ServiceCard";
import { homeImages } from "../../app/data/home";

export const galleryImages = [homeImages.pasta, homeImages.studio];

export function InternalPage({ alternate = false }: { alternate?: boolean }) {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero
        title="Проверка внутренних страниц"
        overline="Тестовый стенд"
        description="Компоненты показаны с демонстрационным текстом и фотографиями из главной страницы."
        breadcrumbs={[
          { label: "Главная", to: "/" },
          { label: "Для взрослых", to: "/dlya-vzroslyh/" },
          { label: "Проверка внутренних страниц" },
        ]}
        image={{ ...homeImages.hero, focalPoint: "50% 54%" }}
        action={{ label: "К примерам", to: "#examples" }}
        layout={alternate ? "stacked" : "split"}
      />
      <PageSection id="examples" title="Что проверить" overline="Композиция" tone="alternate">
        <FeatureGrid items={[
          { id: "hierarchy", title: "Иерархия", description: "Заголовки и последовательность чтения." },
          { id: "layout", title: "Сетка", description: "Переносы и отступы на разных ширинах." },
          { id: "focus", title: "Фокус", description: "Видимый контур на интерактивных элементах." },
          { id: "media", title: "Фотографии", description: "Кадрирование и переключение в лайтбоксе." },
        ]} />
      </PageSection>
      <PageSection title="Карточка услуги" width="narrow">
        <ServiceCard
          title="Пример карточки"
          description="Краткое описание отведено под согласованный контент."
          image={homeImages.pasta}
          action={{ label: "Подробнее", to: "/dop-uslugi/" }}
        />
      </PageSection>
      <ImageTextSection
        title="Фотография рядом с текстом"
        image={homeImages.studio}
        imageSide={alternate ? "right" : "left"}
        caption="Иллюстрация кухонного пространства"
      >
        <p>Подпись относится к изображению и доступна в порядке чтения.</p>
      </ImageTextSection>
      <PageGallery title="Галерея" images={galleryImages} layout={alternate ? "grid" : "mosaic"} />
      <FAQSection title="Вопросы" items={[
        { id: "gallery", question: "Как переключить фото?", answer: <p>Используйте стрелки клавиатуры или кнопки.</p> },
      ]} />
      <PageCTA
        title="Следующее действие"
        description="Проверка ссылки в завершающей секции."
        action={{ label: "На главную", to: "/" }}
        layout={alternate ? "inline" : "centered"}
      />
    </main>
  );
}
