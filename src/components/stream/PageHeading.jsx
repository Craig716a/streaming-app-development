export default function PageHeading({ eyebrow, title, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
      </div>
      {action}
    </div>
  );
}