interface PizzaProps {
  name: string;
  description: string;
  image?: string;
}

const Pizza = ({ name, description, image }: PizzaProps) => {
  return (
    <div className="pizza">
      <h1>{name}</h1>
      <p>{description}</p>
      <img
        src={image ? image : "https://picsum.photos/200"}
        alt={name}
      />
    </div>
  );
};

export default Pizza;
