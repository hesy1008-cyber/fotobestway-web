interface Props {
  title: string;
  description: string;
  image: string;
  category: string;
}

export default function CategoryHero({
  title,
  description,
  image,
  category,
}: Props) {
  return (
    <section
      className="categoryHero"
      style={{ backgroundImage: `url("${image}")` } as React.CSSProperties}
    >
      <div className="categoryHeroOverlay" />
      <div className="categoryHeroContent">
        {category && <p className="categoryHeroLabel">{category}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
        <a href="#products" className="categoryHeroBtn">
          EXPLORE PRODUCTS <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
