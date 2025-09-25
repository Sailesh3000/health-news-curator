function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

export default Card;