import { useState } from "react";
import { motion } from "framer-motion";
import "../style/CurrentProductTable.css";

const CurrentProductTable = ({ products = [], newProduct, setNewProduct, handleProductCreation }) => {
  const [showCurrentProductTable, setShowCurrentProductTable] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductCreationForm, setShowProductCreationForm] = useState(false);
  const [localProduct, setLocalProduct] = useState({name: "", creation_time: "", cost: "", currency: "USD"})

  // Filter products based on the search query
  const filteredProducts = products
    .filter((product) => product && product.name)
    .filter((product) =>
      product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
    );

  return (
    <div className="current-product-table-container">
      <button
        className="toggle-current-product-table-btn"
        onClick={() => setShowCurrentProductTable((prev) => !prev)}
      >
        {showCurrentProductTable
          ? "Hide Current Product Table"
          : "View Current Product Table"}
      </button>

      {showCurrentProductTable && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="current-product-table-wrapper"
        >
          <div className="current-product-table-header">
            <input
              type="text"
              className="current-product-search-input"
              placeholder="Search Product Names..."
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
            />
            <button
              className="create-product-toggle-btn"
              onClick={() => setShowProductCreationForm((prev) => !prev)}
            >
              {showProductCreationForm ? "Close Product Form" : "Create Product"}
            </button>
          </div>

          <div className="current-product-table-body">
            <table className="current-product-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Cost (Currency)</th>
                  <th>Creation Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>
                        {product.cost || "N/A"} ({product.currency || "N/A"})
                      </td>
                      <td>{product.creation_time ? new Date(product.creation_time).toLocaleString() : "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {showProductCreationForm && (
        <>
          <motion.div
            className="product-creation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProductCreationForm(false)}
          ></motion.div>
          <motion.div
            className="product-creation-form-popup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2>Create Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProductCreation(localProduct);
                setShowProductCreationForm(false); // Close form after submission
                setLocalProduct({name: "", creation_time: "", cost: "", currency: "USD"})
              }}
            >
              <input
                type="text"
                placeholder="Product Name"
                value={localProduct.name}
                onChange={(e) =>
                  setLocalProduct({ ...localProduct, name: e.target.value })
                }
                required
              />
              <input
                type="datetime-local"
                placeholder="Creation Time"
                value={localProduct.creation_time}
                onChange={(e) =>
                  setLocalProduct({ ...localProduct, creation_time: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Cost"
                value={localProduct.cost}
                onChange={(e) =>
                  setLocalProduct({ ...localProduct, cost: e.target.value })
                }
                required
              />
              <select
                value={localProduct.currency}
                onChange={(e) =>
                  setLocalProduct({ ...localProduct, currency: e.target.value })
                }
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <button type="submit">Create Product</button>
            </form>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CurrentProductTable;
