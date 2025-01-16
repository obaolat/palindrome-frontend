import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "../style/MegaTaskWindow.css";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:5000", // Flask backend URL
});


const MegaTaskWindow = ({
  showMegaTask, setShowMegaTask, tasks, products, deployedInputProducts, deployedOutputProducts, toggleProducts, 
  toggleProductsRight, showProducts, showProductsRight, toggleSettings,toggleSettingsRight,
  setShowTimes,setShowCreateProduct,setShowCreateOutputProduct,showSettings,newProduct,outputSettings,
  inputSettings,settingsSearchQuery,handleSettingsSearch,deleteFromSettingsTable,filteredProducts,
  addToSettingsTable, setNewProduct,toggleDeploymentStatus,showCreateProduct, handleInputProductCreation,
  handleOutputProductCreation, showSettingsRight, searchQueryOutput, handleOutputSettingsSearch, addToSettingsTableright, 
  deleteFromOutputSettingsTable, toggleOutputDeploymentStatus, showCreateOutputProduct,
  showTaskSettings, setShowTaskSettings, fetchTasksForProduct, newTask, setNewTask,
  setTaskType, taskSearchQuery, handleTaskSearch, attachedTasks, setShowTaskCreationForm, showTaskCreationForm,
  handleTaskCreationauto, addTaskToProduct, filteredTasks, taskType, deleteTaskFromProduct, filteredAttachedTasks,
  setAttachedTasks, setRelatedTasks, setSettingsTableChanged, fetchChain, ChainVisualization, setRectangles, rectangles, handleTaskSelection,
  selectedTask, setSelectedTask, contextOutputSettings, contextInputSettings, setShowInputTasks, setShowOutputTasks, selectedOval, setSelectedOval,
  handleProductSelection,selectedProduct, setSelectedProduct, isExpanded, setExpanded, showTask
 
}) => {
  const [BigOval, setbigOval] = useState (false);
  //const [selectedTask, setSelectedTask] = useState(null);
  //const [selectedProduct, setSelectedProduct] = useState(null);


 // console.log("SelectedOval state:", selectedOval);




  // Strict Selection Rules
  /*
  const handleTaskSelection = async (taskId) => {
    try {
      // Find the task to extract its name
      const task = tasks.find((t) => t.id === parseInt(taskId));
      if (!task) {
        console.warn("Task not found with ID:", taskId);
        return;
      }
  
      // Make the API call
      const response = await axiosInstance.post(`/api/tasks/${taskId}/contexts`);
      const { context_id } = response.data;
  
      // Update the selected task with name and context
      setSelectedTask({ id: taskId, name: task.name, contextId: context_id });
      console.log("Task selected:", { id: taskId, contextId: context_id });
      setSelectedProduct(null); // Clear product selection
  
      console.log(`New context created for task ${taskId}:`, context_id);
    } catch (error) {
      console.error("Error creating context for task:", error.response?.data || error.message);
    }
  };
  
  useEffect(() => {
    console.log("Current state of selectedOval:", selectedOval);
  }, [selectedOval]);
*/
  useEffect(() => {
    console.log("Selected Product in MegaTaskWindow:", selectedProduct);
    console.log("Selected Oval in MegaTaskWindow:", selectedOval);
  }, [selectedProduct, selectedOval]);
  
    
  
  /*

  const handleProductSelection = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    if (product) {
      setSelectedProduct(product);
      setSelectedTask(null); // Clear task selection
      console.log(`Product with ID ${productId} selected:`, product);
    }
  };
  */

  const getMegaTaskHeight = () => {
    const baseHeight = 300;
    const additionalHeight = 40;
    return baseHeight + additionalHeight;
  };

  return (
    <>
      {showMegaTask && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="mega-task-window"
          style={{ minHeight: `${getMegaTaskHeight()}px` }}
        >
          <h2>Create Mega Task</h2>
          <button
            className="close-mega-task-btn"
            onClick={() => setShowMegaTask(false)}
          >
            Close
          </button>

          {/* Selection UI */}
          <div className="task-product-selection">
            <h3>Select a Task </h3>
            <select
  onChange={(e) => {
    const value = e.target.value;
    if (value) {
      const [type, id] = value.split("-");
      if (type === "task") {
        handleTaskSelection(id);
      } 
    }
  }}
  value={
    selectedTask
      ? `task-${selectedTask.id}`
      : selectedProduct

  }
>
  <option value="" disabled>
    -- Select --
  </option>
  {tasks.map((task) => (
    <option key={task.id} value={`task-${task.id}`}>
      {task.name} (Task)
    </option>
  ))}
 
</select>


          </div>

          {/* Display Selected Task or Product */}
          <div className="task-product-line">
            {selectedTask && (
              <div className="small-container">
                <motion.div
                  className="task-rectangle-small"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => setExpanded(true)}
                >
                  <h2>{selectedTask.name}</h2>
                </motion.div>

                
              </div>
            )}
      
      {selectedProduct && selectedProduct.length > 0 && (
  <>
    {/* Right Side (toggleProductsRight) */}
    {showProducts && (
      <div className="product-oval-container right">
        {selectedProduct
          .filter((product) => product.side === "right") // Filter for right side
          .map((product, index) => (
            <motion.div
              key={product.id}
              className="product-oval"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                pointerEvents: "auto",
                marginTop: `${index * 10}px`, // Dynamic spacing
              }}
              onClick={() => {
        
                setSelectedOval(product);
              }}
            >

              <h3>{product.name}</h3>
          
            </motion.div>
          ))}
      </div>
    )}

    {/* Left Side (handleProductSelection) */}
    <div className="product-oval-container left">
      {selectedProduct
        .filter((product) => product.side === "left") // Filter for left side
        .map((product, index) => (
          <motion.div
            key={product.id}
            className="product-oval"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              pointerEvents: "auto",
              marginTop: `${index * 10}px`, // Dynamic spacing
            }}
            onClick={() => console.log("Clicked on left-side product:", product)}
          >
            <h3>{product.name}</h3>
          </motion.div>
        ))}
    </div>
  </>
)}

{rectangles && rectangles.length > 0 && (
  <>
    {/* Right Side {toggleTaskRight} */}
    {showTask && (
      <div className="task-rectangle-container right">
        {rectangles
          .filter((task) => task.side === "right") // Filter for right side
          .map((task, index) => (
            <motion.div
              key={task.id}
              className="task-rectangle-small"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                pointerEvents: "auto",
                marginTop: `${index * 10}px`, // Dynamic spacing
              }}
              onClick={() => {
        
                isExpanded(task)
              }}
            >
             
              <h3>{task.name}</h3>
            </motion.div>
          ))}
      </div>
    )}

    {/* Left Side  */}
    <div className="product-oval-container left">
      {rectangles
        .filter((task) => task.side === "left") // Filter for left side
        .map((task, index) => (
          <motion.div
            key={task.id}
            className="task-rectangle-small"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              pointerEvents: "auto",
              marginTop: `${index * 10}px`, // Dynamic spacing
            }}
            onClick={() =>
            isExpanded (task)
            }
          >
            <h3>{task.name}</h3>
          </motion.div>
        ))}
    </div>
  </>
)}

</div>


          {isExpanded && (
            <>
              <div className="task-overlay"></div>
              <motion.div
                className="task-rectangle-large"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h2>{selectedTask.name}</h2>
                <div className="button-container">
                    <button className="toggle-settings" onClick={toggleSettings}>⚙</button>
                    <button className="toggle-d" data-type = "input" onClick={() => toggleProducts(selectedTask)}>D</button>
                </div>

                <div className="right-button-container">
                    <button className="toggle-settings" onClick={toggleSettingsRight}>⚙</button>
                    <button className="toggle-d" onClick={toggleProductsRight}>D</button>
                </div>
                <button className="time-button" onClick={() => setShowTimes((prev) => !prev)}>
                    Start/End Time
                </button>
                <button
                  className="close-task-button"
                  onClick={() => setExpanded(false)}
                >
                  X
                </button>
              </motion.div>

              {showSettings && (
                <div className="settings-container">
                <div className="settings-table">
                    <h3>Input Settings for {selectedTask?.name || "Task"}</h3>
                    <button
                    className="settings-icon"
                    onClick={() => setShowCreateProduct(true)}
                    >
                    ⚙
                    </button>
            
                    {/* Input Product Title with Search Bar */}
                    <div className="product-search-container">
                    <label>Input Product:</label>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={settingsSearchQuery}
                        onChange={(e) => handleSettingsSearch(e.target.value)}
                        className="search-bar"
                    />
                    </div>
            
                    {/* Dynamic Search Suggestions */}
                    {settingsSearchQuery && (
                    <div className="search-suggestions">
                        {filteredProducts.map((product) => (
                        <div key={product.id} className="search-item">
                            <span>{product.name}</span>
                            <button
                            className={`add-button ${(contextInputSettings[selectedTask?.contextId] || []).some((p) => p.id === product.id) ? "disabled" : "enabled"}`}
                            disabled={(contextInputSettings[selectedTask?.contextId] || []).some((p) => p.id === product.id)} // Disable if already added
                            onClick={() => addToSettingsTable(product)}
                            >
                            {(contextInputSettings[selectedTask?.contextId] || []).some((p) => p.id === product.id) ? "Added" : "Add"}
                            </button>
                        </div>
                        ))}
                    </div>
                    )}
            
                    {/* Input Products Table */}
                    <table>
                    <thead>
                        <tr>
                        <th>Input Product</th>
                        <th>Deployment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(contextInputSettings[selectedTask?.contextId] || []).length > 0 ? (
                        (contextInputSettings[selectedTask?.contextId] || []).map((product) => (
                            <tr key={product.id}>
                            <td>
                                {product.name}
                                <button
                                className="delete-button"
                                onClick={() => deleteFromSettingsTable(product.id)}
                                >
                                X
                                </button>
                            </td>
                            <td>
                                <button
                                className={`deployment-button ${
                                    product.deployment_state === "V" ? "deployed" : "not-deployed"
                                }`}
                                onClick={() =>
                                    toggleDeploymentStatus(product.id, product.deployment_state)
                                }
                                >
                                {product.deployment_state}
                                </button>
                            </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan="2">No products added to input table</td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            
                {/* Product Creation Form */}
                {showCreateProduct && (
                  <>
                    {/* Dark overlay */}
                    <div
                      className="modal-overlay"
                      onClick={() => setShowCreateProduct(false)} // Close on overlay click
                    ></div>

                    {/* Modal content */}
                    <div className="modal-content">
                      <h3>Create a New Product</h3>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleInputProductCreation();
                          setShowCreateProduct(false); // Close the modal after creation
                        }}
                      >
                        <div className="form-group">
                          <label htmlFor="productName">Name:</label>
                          <input
                            type="text"
                            id="productName"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="creationTime">Creation Time:</label>
                          <input
                            type="datetime-local"
                            id="creationTime"
                            value={newProduct.creation_time}
                            onChange={(e) => setNewProduct({ ...newProduct, creation_time: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cost">Cost:</label>
                          <input
                            type="number"
                            id="cost"
                            value={newProduct.cost}
                            onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="currency">Currency:</label>
                          <select
                            id="currency"
                            value={newProduct.currency}
                            onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                            required
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="NGN">NGN</option>
                          </select>
                        </div>
                        <div className="modal-actions">
                          <button type="submit">Create</button>
                          <button type="button" onClick={() => setShowCreateProduct(false)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}

                </div>
            )}
    



      {/*Output SettingsTable*/}    
      {showSettingsRight && (
        <div className="output-settings-table">
          <h3>Output Settings for {selectedTask?.name || "Task"}</h3>

          <button
            className="settings-icon"
            onClick={() => setShowCreateOutputProduct(true)}
          >
            ⚙
          </button>

          
          {/* Output Product Title with Search Bar */}
          <div className="product-search-container">
            <label>Output Product:</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQueryOutput}
              onChange={(e) => {
                console.log("Search bar triggered with query:", e.target.value);
                handleOutputSettingsSearch(e.target.value);}}
              className="search-bar"
            />
          </div> 


        {/* Dynamic Search Suggestions */}
        {searchQueryOutput && (
            <div className="search-suggestions">
              {filteredProducts.map((product) => (
                <div key={product.id} className="search-item">
                  <span>{product.name}</span>
                  <button
                    className={`add-button ${(contextOutputSettings[selectedTask?.contextId] || []).some((p) => p.id === product.id) ? "disabled" : "enabled"}`}
                    disabled={(contextOutputSettings[selectedTask?.contextId] || []).some((p) => p.id === product.id)}
                    onClick={() => addToSettingsTableright(product)} // Ensure this is intentional
                    >
                    {(contextOutputSettings[selectedTask?.contextId] || []).some((p) => p.id === product.id) ? "Added" : "Add"}
                    </button>

                </div>
              ))}
            </div>
          )}

            {/* Output Products Table */}
                <table>
                  <thead>
                    <tr>
                      <th>Output Product</th>
                      <th>Deployment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(contextOutputSettings[selectedTask?.contextId] || []).length > 0 ? (
                      contextOutputSettings[selectedTask?.contextId].map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}
                          <button
                          className="delete-button"
                          onClick={() => deleteFromOutputSettingsTable(product.id)}
                        >
                          X
                        </button>
                          </td>
                          <td>
                            <button
                              className={`deployment-button ${
                                product.deployment_state === "V" ? "deployed" : "not-deployed"
                              }`}
                              onClick={() =>
                                toggleOutputDeploymentStatus(product.id, product.deployment_state)
                              }
                            >
                              {product.deployment_state}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2">No products added to output table</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Create Product Interface */}
            {showCreateOutputProduct && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Create a New Product</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault(); // Prevent the default form submission
                      handleOutputProductCreation(); // Pass `true` to auto-add to input
                      setShowCreateOutputProduct(false);
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="productName">Name:</label>
                      <input
                        type="text"
                        id="productName"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="creationTime">Creation Time:</label>
                      <input
                        type="datetime-local"
                        id="creationTime"
                        value={newProduct.creation_time}
                        onChange={(e) => setNewProduct({ ...newProduct, creation_time: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cost">Cost:</label>
                      <input
                        type="number"
                        id="cost"
                        value={newProduct.cost}
                        onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="currency">Currency:</label>
                      <select
                        id="currency"
                        value={newProduct.currency}
                        onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                        required
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="NGN">NGN</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="submit">Create and Add to Input</button>
                      <button
                        type="button"
                        onClick={() => setShowCreateOutputProduct(false)} // Close modal on cancel
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
              </div>

      
      )}

      



              
            
            
            </>
          )} 

        {selectedOval && (
        <div className="enlarged-oval-overlay">
          <div className="enlarged-oval">
          
          <button
            className="toggle-settings-left"
            onClick={() => {
              
              setTaskType("input")
              setShowTaskSettings(true);
              fetchTasksForProduct("input", selectedProduct ); // Fetch related tasks
              setSelectedProduct(selectedOval)
            }}
          >
            ⚙
          </button>
          <button
            className="toggle-d"
            onClick={() => setShowInputTasks((prev) => !prev)}
          >
            D
          </button>
            <h3>{selectedOval.name}</h3>
            <button
              className="toggle-settings-right"
              onClick={() => {
                setTaskType("output"); // Specify this is for input products
                setShowTaskSettings(true);
                fetchTasksForProduct("output", selectedProduct); // Fetch related tasks
                setSelectedOval(selectedOval)

              }}
            >
              ⚙
            </button>
            <button
              className="toggle-d"
              onClick={() => setShowOutputTasks((prev) => !prev)}
            >
              D
            </button>
          </div>
          <button className="close-enlarged-oval" onClick={() => setSelectedOval(null)}>X</button>

               
          {showTaskSettings && (

            <div className="task-settings-container">
              <h3>{taskType === "input" ? "Input Tasks" : "Output Tasks"} for Product</h3>

              {/* Search Input */}
              <div className="search-container">
                <input
                  type="text"
                  className="task-search-input"
                  placeholder="Search tasks..."
                  value={taskSearchQuery}
                  onChange={(e) => handleTaskSearch(e.target.value)}
                />
              </div>

              {taskSearchQuery&& (
                <div>
                {filteredTasks.map((task)=>(
                  <div key ={task.id} className="">
                    <span>{task.name}</span>
                    <button
                      onClick={() => addTaskToProduct(task)}
                      disabled={filteredAttachedTasks.some((t) => t.id === task.id)}
                    >
                      {filteredAttachedTasks.some((t) => t.id === task.id) ? "Added" : "Add"}
                    </button>
                    </div>
                ))}
                </div>
              )
              
              }

              {/* Tasks Table */}
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Cost</th>
                    <th>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttachedTasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      <td>{task.cost}</td>
                      <td>{task.currency}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => deleteTaskFromProduct(task.id, selectedProduct.id)}
                        >
                          X
                        </button>
                      </td>

                      
                      
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Create Task Button */}
              <button
                className="create-task-button"
                onClick={() => setShowTaskCreationForm(true)}
              >
                Create Task
              </button>

              {/* Close Button */}
              <button className="close-button" onClick={() => setShowTaskSettings(false)}>
                Close
              </button>
            </div>
          )}

          {/* Task Creation Form */}
          {showTaskCreationForm && (
              <div className="task-creation-form-container">
                <div className="auto-task-creation-form">
                  <h3>Create New Task</h3>
                  <form onSubmit={(e) =>{ 
                    e.preventDefault();
                    handleTaskCreationauto(e)}}>
                    {/* Task Name */}
                    <label>
                      Task Name:
                      <input
                        type="text"
                        value={newTask.name}
                        onChange={(e) =>
                          setNewTask((prev) => ({ ...prev, name: e.target.value }))
                        }
                        required
                      />
                    </label>
            
                    {/* Start Time */}
                    <label>
                      Start Time:
                      <input
                        type="datetime-local"
                        value={newTask.start_time}
                        onChange={(e) =>
                          setNewTask((prev) => ({ ...prev, start_time: e.target.value }))
                        }
                      />
                    </label>
            
                    {/* End Time */}
                    <label>
                      End Time:
                      <input
                        type="datetime-local"
                        value={newTask.end_time}
                        onChange={(e) =>
                          setNewTask((prev) => ({ ...prev, end_time: e.target.value }))
                        }
                      />
                    </label>
            
                    {/* Cost */}
                    <label>
                      Cost:
                      <input
                        type="number"
                        value={newTask.cost}
                        onChange={(e) =>
                          setNewTask((prev) => ({ ...prev, cost: e.target.value }))
                        }
                        required
                      />
                    </label>
            
                    {/* Currency */}
                    <label>
                      Currency:
                      <select
                        value={newTask.currency}
                        onChange={(e) =>
                          setNewTask((prev) => ({ ...prev, currency: e.target.value }))
                        }
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="NGN">NGN</option>
                      </select>
                    </label>
            
                    {/* Submit and Cancel Buttons */}
                    <div className="form-buttons">
                      <button type="submit">Save Task</button>
                      <button type="button" onClick={() => setShowTaskCreationForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
                  
                    
                  </div>
                )}
        </motion.div>
      )}
    </>
  );
};

export default MegaTaskWindow;
