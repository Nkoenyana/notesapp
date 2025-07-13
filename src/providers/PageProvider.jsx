

export function PageProvider({ children, title }) {
  return (
    <div>
        <h3>{title}</h3>
        <div>{children}</div>
    </div>
  );
}