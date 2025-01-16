import React from "react";

import "../style/style.css";

const ProductOval = ({ products }) => {
  return (
    <div className="product-oval-container">
      {products.map((product) => (
        <div key={product.id} className="product-oval">
          <h3>{product.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default ProductOval;
