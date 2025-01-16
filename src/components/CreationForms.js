import React from "react";
import "../style/CreationForm.css"
import { motion, AnimatePresence } from "framer-motion";

const CreationForms = ({
  newTask,
  setNewTask,
  handleTaskCreation,
  newProduct,
  setNewProduct,
  handleProductCreation,
  showTaskForm,
  setShowTaskForm,
  showProductForm,
  setShowProductForm,
}) => {
  return (
    <div className="creation-forms">
      {/* Task Creation Form */}
      <button onClick={() => setShowTaskForm((prev) => !prev)}>
        {showTaskForm ? "Close Task Form" : "Create Task"}
      </button>
      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            className="task-creation-form"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2>Create Task</h2>
            <input
              type="text"
              placeholder="Task Name"
              value={newTask.name}
              onChange={(e) =>
                setNewTask({ ...newTask, name: e.target.value })
              }
            />
            <input
              type="datetime-local"
              placeholder="Start Time"
              value={newTask.start_time}
              onChange={(e) =>
                setNewTask({ ...newTask, start_time: e.target.value })
              }
            />
            <input
              type="datetime-local"
              placeholder="End Time"
              value={newTask.end_time}
              onChange={(e) =>
                setNewTask({ ...newTask, end_time: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Cost"
              value={newTask.cost}
              onChange={(e) =>
                setNewTask({ ...newTask, cost: e.target.value })
              }
            />
            <select
              value={newTask.currency}
              onChange={(e) =>
                setNewTask({ ...newTask, currency: e.target.value })
              }
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <button onClick={() => handleTaskCreation(newTask)}>
              Create Task
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Creation Form */}
      <button onClick={() => setShowProductForm((prev) => !prev)}>
        {showProductForm ? "Close Product Form" : "Create Product"}
      </button>
      <AnimatePresence>
        {showProductForm && (
          <motion.div
            className="product-creation-form"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2>Create Product</h2>
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              type="datetime-local"
              placeholder="Creation Time"
              value={newProduct.creation_time}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  creation_time: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Cost"
              value={newProduct.cost}
              onChange={(e) =>
                setNewProduct({ ...newProduct, cost: e.target.value })
              }
            />
            <select
              value={newProduct.currency}
              onChange={(e) =>
                setNewProduct({ ...newProduct, currency: e.target.value })
              }
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <button onClick={() => handleProductCreation(newProduct)}>
              Create Product
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreationForms;
