import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as d3 from 'd3'
import axios from "axios";
import '../style/MegaTaskWindow_v2.css';

const axiosInstance = axios.create({
    baseURL: "https://palindrome-backend-1.onrender.com", // Flask backend URL
});

const Dropdown = ({ options, onSelect }) => {
    return (
        <select onChange={(e) => onSelect(e.target.value)}>
            <option value="">Select an option</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
};

const Node = ({ id, name, type, x, y, onClick }) => {
    return (
        <motion.div
            className={`${type === "task" ? "task-rectangle" : "product-oval"}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ left: x, top: y, position: "absolute" }}
            onClick={() => onClick(id, type)}
        >
            {name}
        </motion.div>
    );
};
/*
const Arrow = ({ fromX, fromY, toX, toY }) => (
    <svg className="arrow">
        <line
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke="black"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
        />
        <defs>
            <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
            >
                <polygon points="0 0, 10 3.5, 0 7" fill="black" />
            </marker>
        </defs>
    </svg>
);
*/
 
const ChainBuilder = ({
    tasks,
    products, chain, setChain, connections, setConnections, fetchTasksForProduct, setShowInputTasks, setShowOutputTasks, showTaskSettings, taskType, taskSearchQuery,
    selectedTask, handleOutputProductCreation, setTaskType, setShowTaskSettings, handleTaskSearch, filteredTasks, addTaskToProduct, filteredAttachedTasks,
    selectedProduct, contextOutputSettings, addToSettingsTableright, deleteFromOutputSettingsTable, toggleOutputDeploymentStatus, showCreateOutputProduct,
    setSelectedTask,handleInputProductCreation, newProduct, setNewProduct, showSettingsRight, setShowCreateOutputProduct, handleOutputSettingsSearch,
    setSelectedProduct, contextInputSettings,deleteFromSettingsTable,addToSettingsTable,toggleDeploymentStatus, showCreateProduct, handleTaskCreationauto,
    fetchTasks, showSettings, setShowCreateProduct, searchQueryOutput, settingsSearchQuery, handleSettingsSearch, filteredProducts, showTaskCreationForm,
    fetchProducts, toggleSettings, toggleProducts, toggleSettingsRight, toggleProductsRight, setShowTimes, deleteTaskFromProduct, setShowTaskCreationForm, 
    newTask, setNewTask, toggleTaskDeploymentStatus, toggleTasks, toggleTasksRight,
}) => {

    useEffect(() => {
        console.log("Updated chain:", chain);
      }, [chain]);
      
    const [selectedType, setSelectedType] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedOval, setSelectedOval] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSearch = (e) => {
      const query = e.target.value;
        setSearchTerm(query);

        if (query.trim() === "") {
          setFilteredItems ([]);
          return
        }
        if (selectedType === "Task") {
          setFilteredItems(
            tasks.filter((task) =>
              task.name.toLowerCase().includes(e.target.value.toLowerCase())
            )
          );
        } else if (selectedType === "Product") {
          setFilteredItems(
            products.filter((product) =>
              product.name.toLowerCase().includes(e.target.value.toLowerCase())
            )
          );
        }
      };

    const handleTaskSelection = async (taskId) => {
        try {
            const response = await axiosInstance.post(`/api/tasks/${taskId}/contexts`);
            const { context_id } = response.data;
            const task = tasks.find((task) => task.id === taskId);
            const newTask = { ...task, context_id: context_id, type: "task", x: 100, y: 100 };
            setSelectedTask(newTask);

            const responseProducts = await axiosInstance.get(
                `/api/tasks/${taskId}/contexts/${context_id}/products`
            );
            const { input_products, output_products } = responseProducts.data;

            const newProducts = [...input_products, ...output_products].map((product, index) => ({
                ...product,
                type: "product",
                x: newTask.x - 150 + index * 50,
                y: newTask.y + 100,
            }));

            setChain([newTask, ...newProducts]);

            const newConnections = newProducts.map((product) => ({
                from: { x: newTask.x + 90, y: newTask.y + 25 },
                to: { x: product.x, y: product.y + 25 },
            }));

            setConnections(newConnections);
            console.log(`Task selected:`, newTask);
             
        } catch (error) {
            console.error("Error selecting task:", error);
        }
    };

    const handleProductSelection = async (productId) => {
        try {
          // Request an instance for the selected product
          const response = await axiosInstance.post(`/api/products/${productId}/instance`);
          const { instance_id } = response.data;
      
          // Find the selected product and update its details
          const product = products.find((product) => product.id === productId);
          const newProduct = { ...product, instance_id: instance_id, type: "product", x: 100, y: 200 };
          setSelectedProduct(newProduct);
      
          // Fetch input tasks
          const responseInputTasks = await axiosInstance.get(
            `/api/products/${productId}/instance/${instance_id}/tasks`,
            { params: { type: "input" } }
          );
          const inputTasks = responseInputTasks.data;
      
          // Fetch output tasks
          const responseOutputTasks = await axiosInstance.get(
            `/api/products/${productId}/instance/${instance_id}/tasks`,
            { params: { type: "output" } }
          );
          const outputTasks = responseOutputTasks.data;
      
          // Combine and process tasks
          const newTasks = [...inputTasks, ...outputTasks].map((task, index) => ({
            ...task,
            type: "task",
            x: newProduct.x - 150 + index * 50,
            y: newProduct.y + 100,
          }));
      
          // Update the chain with the new product and tasks
          setChain([newProduct, ...newTasks]);
      
          // Create new connections
          const newConnections = newTasks.map((task) => ({
            from: { x: newProduct.x + 90, y: newProduct.y + 25 },
            to: { x: task.x, y: task.y + 25 },
          }));
          setConnections(newConnections);
      
          console.log(`Product selected:`, newProduct);
        } catch (error) {
          console.error("Error selecting product:", error);
        }
      };
      

    const handleNodeClick = async (id, type) => {
        if (type === "product") {
            const product = chain.find((n) => n.id === id && n.type === "product");
            setSelectedOval(product);
            console.log("Selected Oval:", product);


        } else if (type === "task") {
            const task = chain.find((n) => n.id === id && n.type === "task");
            setIsExpanded(true);
            console.log("Expanded Task:", task);


            // Fetch products connected to the task

        }
    };

    const updateConnections = () =>{
        const svg = d3.select(".chain-visualization").select("svg");
        if (!svg.empty()) {
            svg.remove();
        }

        const newSvg = d3
            .select(".chain-visualization")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("position", "absolute");
        connections.forEach((conn) => {
            newSvg
                .append("line")
                .attr("x1", conn.from.x)
                .attr("y1", conn.from.y)
                .attr("x2", conn.to.x)
                .attr("y2", conn.to.y)
                .attr("stroke", "black")
                .attr("stroke-width", 2);

        });
    };

    return (
        <div className="chain-builder">
            <h2>Build Your Chain</h2>

            <Dropdown options={["Task", "Product"]} onSelect={(type) => {
                setSelectedType(type);
                setSearchTerm("");
                setFilteredItems([]);
                if (type === "Task") fetchTasks();
                if (type === "Product") fetchProducts();
            }} />

            {selectedType && (
                <div>
                    <input
                        type="text"
                        placeholder={`Search ${selectedType}s`}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <ul>
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <li
                                    key={`${selectedType}-${item.id}`}
                                    onClick={() =>
                                        selectedType === "Task"
                                            ? handleTaskSelection(item.id)
                                            : handleProductSelection(item.id)
                                    }
                                >
                                    {item.name}
                                </li>
                            ))
                        ) : (
                            <li>No {selectedType} found</li>
                        )}
                    </ul>
                </div>
            )}

            <div className="chain-visualization">
                    <div className="task-container">
                    {chain
                        .filter((node) => node.type === "task")
                        .map((node) => (
                        <Node
                            key={`task-${node.context_id}`}
                            id={node.id}
                            name={node.name}
                            type={node.type}
                            x={node.x}
                            y={node.y}
                            onClick={handleNodeClick}
                        />
                        ))}
                    </div>

                    <div className="product-container">
                    {chain
                        .filter((node) => node.type === "product")
                        .map((node) => (
                        <Node
                            key={`product-${node.instance_id}`}
                            id={node.id}
                            name={node.name}
                            type={node.type}
                            x={node.x}
                            y={node.y}
                            onClick={handleNodeClick}
                        />
                        ))}
                    </div>
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
                    <button className="toggle-d" data-type = "input" onClick={() =>{ console.log("Triggering toggleProducts with", selectedTask);toggleProducts(selectedTask)}}>D</button>
                </div>

                <div className="right-button-container">
                    <button className="toggle-settings" onClick={toggleSettingsRight}>⚙</button>
                    <button className="toggle-d" onClick={() =>{toggleProductsRight(selectedTask)}}>D</button>
                </div>
                <button className="time-button" onClick={() => setShowTimes((prev) => !prev)}>
                    Start/End Time
                </button>
                <button
                  className="close-task-button"
                  onClick={() => setIsExpanded(false)}
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
                    onClick={(event) => {
                        event.stopPropagation();
                        setShowCreateProduct(true)
                        console.log("isExpanded set to false");
                    }}
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
                            className={`add-button ${(contextInputSettings[selectedTask?.context_id] || []).some((p) => p.id === product.id) ? "disabled" : "enabled"}`}
                            disabled={(contextInputSettings[selectedTask?.context_id] || []).some((p) => p.id === product.id)} // Disable if already added
                            onClick={() => addToSettingsTable(product)}
                            >
                            {(contextInputSettings[selectedTask?.context_id] || []).some((p) => p.id === product.id) ? "Added" : "Add"}
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
                        {(contextInputSettings[selectedTask?.context_id] || []).length > 0 ? (
                        (contextInputSettings[selectedTask?.context_id] || []).map((product) => (
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
                    className={`add-button ${(contextOutputSettings[selectedTask?.context_id] || []).some((p) => p.id === product.id) ? "disabled" : "enabled"}`}
                    disabled={(contextOutputSettings[selectedTask?.context_id] || []).some((p) => p.id === product.id)}
                    onClick={() => addToSettingsTableright(product)} // Ensure this is intentional
                    >
                    {(contextOutputSettings[selectedTask?.context_id] || []).some((p) => p.id === product.id) ? "Added" : "Add"}
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
                    
                    {(contextOutputSettings[selectedTask?.context_id] || []).length > 0 ? (
                      contextOutputSettings[selectedTask?.context_id].map((product) => (
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
            onClick={() => toggleTasks(selectedProduct)}
          >
            D
          </button>
            <h3>{selectedOval.name}</h3>
            <button
              className="toggle-settings-right"
              onClick={() => {
                setTaskType("output"); // Specify this is for input products
                setShowTaskSettings(true);
                fetchTasksForProduct("output", selectedOval); // Fetch related tasks
                setSelectedOval(selectedOval)

              }}
            >
              ⚙
            </button>
            <button
              className="toggle-d"
              onClick={() => {
                console.log("Triggering toggleTasksight with", selectedProduct)
                toggleTasksRight(selectedProduct);
            }}
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
                      onClick={() => addTaskToProduct(task, selectedOval)}
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
                    <th>Deployment</th>
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
                        className={`deployment-button${
                            task.deployment_state === "V" ? "deployed" : "not-deployed"
                        }` }
                        onClick={() =>
                        toggleTaskDeploymentStatus(task.id, task.deployment_state, taskType)
                        }
                        >
                            {task.deployment_state}
                        </button>
                      </td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => deleteTaskFromProduct(task.id, selectedOval.id )}
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
        </div>

        
    );
};

export default ChainBuilder;
