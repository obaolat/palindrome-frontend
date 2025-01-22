import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style/style.css";
import CurrentTaskTable from "./components/CurrentTaskTable";
import CurrentProductTable from "./components/CurrentProductTable";
import MegaTaskWindow from "./components/MegaTaskWindow";
import MegaTaskWindow_v2 from "./components/MegaTaskWindow_v2"
import CreationForms from "./components/CreationForms";
import * as d3 from 'd3'

import { motion, AnimatePresence } from "framer-motion";


const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:5000/", // Flask backend URL
});

function App() {
  const [tasks, setTasks] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [taskDeployments, setTaskDeployments] = useState({}); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSettings, setShowSettings] = useState(false); 
  const [showProductsTable, setShowProductsTable] = useState(false);
  const [showTimes, setShowTimes] = useState(false); 
  const [showProducts, setShowProducts] = useState(true); 
  const [showSettingsRight, setShowSettingsRight] = useState(false); 
  const [showProductsRight, setShowProductsRight] = useState(true); 
  const [searchQueryOutput, setSearchQuery] = useState("");
  const [settingsSearchQuery, setSettingsSearchQuery] = useState(""); // For settings table search
  const [inputSettings, setInputSettings] = useState([]); // Input settings for the selected task
  const [outputSettings, setOutputSettings] = useState([]); // Output settings for the selected task
  const [newTask, setNewTask] = useState({ name: "", start_time: "", end_time: "", cost: "", currency: "USD" });
  const [newProduct, setNewProduct] = useState({ name: "", creation_time: "", cost: "", currency: "USD" });
  const [deployedOutputProducts, setDeployedOutputProducts] = useState([]); // Separate state for deployed output products
  const [deployedInputProducts, setDeployedInputProducts] = useState([]); // Separate state for deployed input products
  const [isExpanded, setExpanded] = useState(false); // Manages whether the large rectangle is shown
  const [selectedOval, setSelectedOval] = useState(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false); // Controls the create product modal
  const [showCreateOutputProduct, setShowCreateOutputProduct] = useState(false);
  const [relatedTasks, setRelatedTasks] = useState([]);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [showTaskSettings, setShowTaskSettings] = useState(false); // To toggle visibility
  const [filteredTasks, setFilteredTasks] = useState([]); // Filtered list for display
  const [showTaskCreationForm, setShowTaskCreationForm] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]); // Tracks the product for task creation
  const [taskType, setTaskType] = useState(""); // Tracks whether it's input or output
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showMegaTask, setShowMegaTask] = useState(false);
  const [showInputTasks, setShowInputTasks] = useState(true); // Default: show input tasks
  const [showOutputTasks, setShowOutputTasks] = useState(true); // Default: show output tasks
  const [settingsTableChanged, setSettingsTableChanged] = useState(false);
  const [attachedTasks, setAttachedTasks]= useState([]);
  const [contextInputSettings, setContextInputSettings] = useState({});
  const [contextOutputSettings, setContextOutputSettings] = useState({});
  const [showTask, setShowTask] = useState({});
  const [chain, setChain] = useState([]);
  const [connections, setConnections] = useState([]);
  const [contextInputTasks, setContextInputTasks] = useState([]);
  const [contextOutputTasks, setContextOutputTasks] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);
  


  const [taskProducts, setTaskProducts] = useState([]);
  const [rectangles, setRectangles] = useState([]);





  useEffect(() => {
    fetchTasks();
    fetchProducts();
  }, []);


  useEffect(() => {
    if (selectedTask && showProducts) {
      console.log("Refreshing input products based on backend changes.");
      refreshProducts();
    }
  }, [selectedTask, refreshTrigger, showProducts]);
  
  useEffect(() => {
    if (selectedTask && showProductsRight) {
      console.log("Refreshing output products based on backend changes.");
      refreshProductsRight();
    }
  }, [selectedTask, refreshTrigger, showProductsRight]);
  
  
  
  
  
  const startPolling = (toggleFunction) => {
    if (!pollingInterval) {
      const interval = setInterval(() => {
        toggleFunction(true); // Call with `isRefresh` to avoid unintentional toggle-off
      }, 5000); // Poll every 5 seconds
      setPollingInterval(interval);
      console.log("Polling started for backend updates.");
    }
  };
  
  // Function to Stop Polling
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      console.log("Polling stopped.");
    }
  };

  /*useEffect(() => {
    if (selectedTask) {
      fetchTaskDeployments(selectedTask.id);
  
    }
  }, [selectedTask]); */
/*
  useEffect(() => {
    if (selectedTask && showProducts) {
      console.log("Refreshing input products due to settings table change or toggle.");
      fetchAndUpdateInputProducts();
    }
  }, [settingsTableChanged, selectedTask, showProducts]);
  
  useEffect(() => {
    if (selectedTask && showProductsRight) {
      console.log("Refreshing output products due to settings table change or toggle.");
      fetchAndUpdateOutputProducts();
    }
  }, [settingsTableChanged, selectedTask, showProductsRight]);
  */



  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get("/api/tasks");
      setTasks(response.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };


  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/api/products");
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };



/*
const fetchTasksForProduct = async (productId, type) => {
  try {
    const response = await axiosInstance.get(`/api/products/${productId}/tasks`, {
      params: { type },
    });
    setRelatedTasks(response.data || []);
  } catch (error) {
    console.error("Error fetching tasks for product:", error);
  }
};

*/
const fetchTasksForProduct = async (type, product) => {
  console.log(product, product.id, product.instance_id)
  if (!product || !product.id || !product.instance_id) {
    console.error("No product or instance selected for fetching tasks.");
   return ;
  }

  try {
    const response = await axiosInstance.get(
      `/api/products/${product.id}/instance/${product.instance_id}/tasks`,
      { params: { type } }
    );
    setRelatedTasks(response.data || []);
    console.log(`Tasks fetched successfully for product ${product.id} (type: ${type}).`);
  } catch (error) {
    console.error("Error fetching tasks for selected product:", error);
  }
};

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

const handleProductSelection = async (productId) => {
  try{
    const product = products.find((p) => p.id ===parseInt(productId))
    if (!product) {
      console.warn ("Product not found with ID:", productId);
      return;
    }
    
    const response = await axiosInstance.post(`/api/products/${productId}/instance`);
    const { instance_id } = response.data;

    setSelectedProduct({id: productId, name: product.name, instance_id: instance_id, deployment_state: "V", side:"left"});
    console.log("Product selected:", { id: productId, instance_id: instance_id });
    setSelectedTask(null);
    console.log(`New instance creared for product ${productId}:`, instance_id);
  }catch(error) {
    console.error("Error creating context for task:", error.response?.data || error.message)
  }
};



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

const handleTaskSearch = async (query) => {
  console.log("Search query entered:", query)
  setTaskSearchQuery(query);

  if (query.trim() === "") {
    setFilteredTasks([]); // Clear results if query is empty
    return;
  }

  // Filter tasks based on the search query
  const filtered = tasks.filter((task) => 
    task.name.toLowerCase().includes(query.toLowerCase())
  );
  setFilteredTasks(filtered);
};

const filteredAttachedTasks = relatedTasks.filter((task) =>
task.name.toLowerCase().includes(taskSearchQuery.toLowerCase())
);



const handleInputProductCreation = async () => {
  await addProductToTask("input");
  if (selectedTask) {
    console.log("Refreshing input products after creation...");
    fetchAndUpdateInputProducts(selectedTask.id);
  }
};

const handleOutputProductCreation = async () => {
   
  await addProductToTask("output");
  if (selectedTask) {
    console.log("Refreshing output products after creation...");
    //fetchAndUpdateOutputProducts(selectedTask.id);
  }
};

/*
  const fetchTaskDeployments = async (taskId) => {
    try {
        const response = await axiosInstance.get(`/api/tasks/${taskId}/products`);
        
        // Update both input and output products in the task-specific state
        setTaskDeployments((prev) => ({
            ...prev,
            [taskId]: {
                input_products: response.data.input_products || [],
                output_products: response.data.output_products || [],
            },
        }));

        // Update input and output settings independently
        setInputSettings(response.data.input_products || []);
        setOutputSettings(response.data.output_products || []);
    } catch (error) {
        console.error("Error fetching task deployments:", error);
    }
};
*/
  
  const handleLeftSettingsClick = (product) => {
    setSelectedProduct(product);
    setTaskType("output"); // Left settings button handles output
    setShowTaskSettings(true);
  };

  const handleRightSettingsClick = (product) => {
    setSelectedProduct(product);
    setTaskType("input"); // Right settings button handles input
    setShowTaskSettings(true);
  };

  const fetchChain = async (productId, depth = 3, direction = "forward") => {
    try {
      const response = await axiosInstance.get(
        `/api/relationships/${productId}?depth=${depth}&direction=${direction}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chain data:", error.message);
    }
  };
    
  
  const handleSettingsSearch = (query) => {
    console.log("Search query in MegaTaskWindow:", query);

    setSettingsSearchQuery(query);
  
    // Filter products not already attached to the selected task
    const filtered = products.filter((product) => {
      const isAlreadyAdded = inputSettings.some((p) => p.id === product.id); // Check if attached to the task
      return product.name.toLowerCase().includes(query.toLowerCase()) && !isAlreadyAdded;
    });
  
    setFilteredProducts(filtered);
  };
  
  
  const handleOutputSettingsSearch = (query) => {
    console.log("Search query in MegaTaskWindow:", query);
    setSearchQuery(query);
  
    const filtered = products.filter((product) => {
      const isAlreadyAdded = outputSettings.some((p) => p.id === product.id);
      console.log("Filtering product:", product, "", isAlreadyAdded);
      return product.name.toLowerCase().includes(query.toLowerCase()) && !isAlreadyAdded;
    });
  
    setFilteredProducts(filtered);
  };
  
/*
  const addToSettingsTable = (product) => {
    if (!selectedTask) {
      console.error("No task selected for adding the product");
      return;
    }
  
    if (inputSettings.some((p) => p.id === product.id)) {
      console.warn("Product is already added to this task.");
      return;
    }
  
    axiosInstance
      .patch(`/api/tasks/${selectedTask.id}/products`, {
        product_id: product.id,
        type: "input",
        action: "add",
      })
      .then(() => {
        // Add product to inputSettings
        const updatedInputSettings = [...inputSettings, { ...product, deployment_state: "V" }];
        setInputSettings(updatedInputSettings);
  
        // Update deployed input products dynamically
        const updatedDeployedInputProducts = updatedInputSettings.filter(
          (p) => p.deployment_state === "V"
        );
        setDeployedInputProducts(updatedDeployedInputProducts);
        setShowProducts(true);
       // fetchAndUpdateInputProducts();

        setSettingsTableChanged((prev) => !prev);

        

        console.log(`Product ${product.name} added to input settings and ovals updated.`);
      })
      .catch((error) =>
        console.error("Error adding product to settings table:", error)
      );
  };
*/  

const addToSettingsTable = async (product) => {
  if (!selectedTask) {
    console.error("No task selected for adding the product");
    return;
  }

  const { id: taskId, context_id } = selectedTask;

  if (!context_id) {
    console.error("No context available for this task.");
    return;
  }

  // Get the input settings for the current context
  const currentInputSettings = contextInputSettings[context_id] || [];

  if (currentInputSettings.some((p) => p.id === product.id)) {
    console.warn("Product is already added to this context.");
    return;
  }

  try {
    // Step 1: Create a new instance for the product
    const instanceResponse = await axiosInstance.post(`/api/products/${product.id}/instance`);
    const { instance_id } = instanceResponse.data;

    // Step 2: Add the product (with the instance_id) to the task
    await axiosInstance.patch(`/api/tasks/${taskId}/contexts/${context_id}/products`, {
      product_id: product.id,
      instance_id: instance_id, // Pass the new instance ID
      type: "input",
      action: "add",
    });



    setRefreshTrigger((prev) => prev + 1);


    // Step 3: Update input settings for the specific context
    const updatedInputSettings = [
      ...currentInputSettings,
      { ...product, deployment_state: "V", instance_id: instance_id },
    ];
    setContextInputSettings((prev) => ({
      ...prev,
      [context_id]: updatedInputSettings,
    }));

    // Optionally update any derived states (like deployed products)
    const updatedDeployedInputProducts = updatedInputSettings.filter(
      (p) => p.deployment_state === "V"
    );
    setDeployedInputProducts(updatedDeployedInputProducts);

    console.log(
      `Product ${product.name} (instance: ${instance_id}) added to input settings for context ${context_id}.`
    );
  } catch (error) {
    console.error(
      "Error adding product to settings table:",
      error.response?.data || error.message
    );
  }
};



/*
  const addToSettingsTableright = (product) => {
    if (!selectedTask) {
      console.error("No task selected for adding the product");
      return;
    }
  
    if (outputSettings.some((p) => p.id === product.id)) {
      console.warn("Product is already added to this task.");
      return;
    }
  
    axiosInstance
      .patch(`/api/tasks/${selectedTask.id}/products`, {
        product_id: product.id,
        type: "output", // Correct type for the right settings
        action: "add",
      })
      .then(() => {
        // Add product to outputSettings
        const updatedOutputSettings = [...outputSettings, { ...product, deployment_state: "V" }];
        setOutputSettings(updatedOutputSettings);
  
        // Update deployed output products dynamically
        const updatedDeployedOutputProducts = updatedOutputSettings.filter(
          (p) => p.deployment_state === "V"
        );
        setDeployedOutputProducts(updatedOutputSettings.filter((p) => p.deployment_state === "V"));
  
        console.log(`Product ${product.name} added to output settings and ovals updated.`);
      })
      .catch((error) =>
        console.error("Error adding product to settings table (right):", error)
      );
  };
  */

  const addToSettingsTableright = async (product) => {
    console.log("Current selectedTask:", selectedTask);
    if (!selectedTask) {
      console.error("No task selected for adding the product");
      return;
    }
  
    const { id: taskId, context_id } = selectedTask;
  
    if (!context_id) {
      console.error("No context available for this task.");
      return;
    }
  
    // Get the output settings for the current context
    const currentOutputSettings = contextOutputSettings[context_id] || [];
  
    if (currentOutputSettings.some((p) => p.id === product.id)) {
      console.warn("Product is already added to this context.");
      return;
    }

    try {
      const instanceResponse = await axiosInstance.post(`/api/products/${product.id}/instance`);
      const { instance_id } = instanceResponse.data;
  
    axiosInstance
      .patch(`/api/tasks/${taskId}/contexts/${context_id}/products`, {
        product_id: product.id,
        instance_id: instance_id,
        type: "output",
        action: "add",
      });
      setRefreshTrigger((prev) => prev + 1);

        // Update output settings for the specific context
        const updatedOutputSettings = [
          ...currentOutputSettings, 
          { ...product, deployment_state: "V", instance_id:instance_id },
        ];
        setContextOutputSettings((prev) => ({
          ...prev,
          [context_id]: updatedOutputSettings,
        }));
  
        // Optionally update any derived states (like deployed products)
        const updatedDeployedOutputProducts = updatedOutputSettings.filter(
          (p) => p.deployment_state === "V"
        );
        setDeployedOutputProducts(updatedDeployedOutputProducts);
  
        console.log(`Product ${product.name} with ${instance_id}added to output settings for context ${context_id}.`);
      
    } catch(error) {
        console.error(
          "Error adding product to settings table (right):", 
          error.response?.data || error.message
      );
    }
  };
  
  
  const fetchAndUpdateInputProducts = async () => {
    try {
      const { deployed_input_products } = await fetchDeployedProducts(selectedTask.id);
      setDeployedInputProducts(deployed_input_products || []);
      console.log("Updated deployed input products:", deployed_input_products);
    } catch (error) {
      console.error("Error fetching input products:", error);
    }
  };

  const fetchAndUpdateOutputProducts = async () => {
    try {
      const { deployed_output_products } = await fetchDeployedProducts(selectedTask.id);
      const filteredDeployedOutputProducts = deployed_output_products.filter(
        (product) => product.deployment_state === "V"
      );
      setDeployedOutputProducts(filteredDeployedOutputProducts || []);
      console.log("Updated deployed output products:", filteredDeployedOutputProducts);
    } catch (error) {
      console.error("Error fetching output products:", error);
    }
  };
  
  const fetchUpdates = async () => {
    if (selectedTask?.id && selectedTask?.context_id) {
      console.log("Fetching updates for selected task:", selectedTask);
  
      try {
        const response = await axiosInstance.get(`/api/tasks/${selectedTask.id}/contexts/${selectedTask.context_id}/products`);
        const { input_products, output_products } = response.data;
  
        setContextInputSettings((prev) => ({
          ...prev,
          [selectedTask.context_id]: input_products,
        }));
  
        setContextOutputSettings((prev) => ({
          ...prev,
          [selectedTask.context_id]: output_products,
        }));
  
        console.log("Input and Output settings updated:", { input_products, output_products });
      } catch (error) {
        console.error("Error fetching updates:", error);
      }
    }
  };
  
  /*
  useEffect(() => {
    console.log("Refresh Trigger changed. Fetching updates...");
    fetchUpdates();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes
  */
  
  const handleTaskCreation = async (taskData) => {
    if (!taskData.name || !taskData.start_time || !taskData.end_time) {
      console.error("Invalid task data:", taskData);
      return;
    }
  
    try {
      console.log("Creating task with validated data:", taskData);
      await axiosInstance.post("/api/tasks", taskData);
      fetchTasks();
      setNewTask({ name: "", start_time: "", end_time: "", cost: "", currency: "USD" });
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error.message);
    }
  };
  

  const handleProductCreation = async (productData) => {
    try {
      await axiosInstance.post("/api/products", productData);
      fetchProducts();
     // if (selectedTask) fetchTaskDeployments(selectedTask.id); // Update deployments dynamically
      setNewProduct({ name: "", creation_time: "", cost: "", currency: "USD" });
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };


 const handleTaskCreationauto = async (e) => {
    e.preventDefault();
  
    console.log("Task creation initiated.", selectedProduct);
  
    // Ensure selectedProduct and taskType are valid
    if (!selectedProduct || !taskType) {
      console.error("No product selected or task type is not set.");
      console.log("Selected Product:", selectedProduct);
      console.log("Task Type:", taskType);
      return;
    }
  
    try {
      // Create the task
      console.log("Sending request to create task with data:", newTask);
      const response = await axiosInstance.post("/api/tasks", newTask);
  
      // Extract task ID
      const createdTaskId = response.data?.task_id; // Correctly map to `task_id`
      console.log("Task creation response:", response.data);
  
      if (!createdTaskId) {
        console.error("Failed to create task. No task ID returned.");
        console.log("Response data:", response.data);
        return;
      }
  
      console.log(`Task successfully created with ID: ${createdTaskId}`);

     

      // Attach the product to the created task
      console.log(
        `Attaching product ${selectedProduct.id} with sel as ${taskType} to task ${createdTaskId}`
      );
      try {
        console.log(`Creating context for task ${createdTaskId} before adding it to product ${selectedProduct.id}`);
    
      
        const contextResponse = await axiosInstance.post(`/api/tasks/${createdTaskId}/contexts`);
        const { context_id } = contextResponse.data;

        console.log(`Adding task ${createdTaskId} (context: ${context_id}) to ${taskType} settings for product ${selectedProduct.id}`);
        console.log(selectedProduct.id)
        await axiosInstance.patch(`/api/tasks/${createdTaskId}/contexts/${context_id}/products`, {
          type: taskType === "input" ? "output" : "input",
          product_id: selectedProduct.id,
          action: "add",
          instance_id:selectedProduct.instance_id
        });

            console.log(`Task ${createdTaskId} successfully added to ${taskType} settings with context ${context_id}.`);


          setAttachedTasks((prev) => [...prev, { ...newTask, context_id: context_id }]);
          setSettingsTableChanged((prev) => !prev); // Trigger reactivity
          setRelatedTasks((prev) => [...prev, { ...newTask, context_id: context_id }]);


      
          // Iterate through all contexts and fetch tasks
      
          fetchTasksForProduct(taskType, selectedProduct.id, selectedProduct.instance_id, );
        
         
 
  
      } catch (patchError) {
        console.error("Error attaching product to task:", patchError.message);
      }
  
      // Refresh task and product data
      console.log("Refreshing products and tasks...");
      fetchProducts();
  
      // Reset the task creation form
      console.log("Resetting task creation form.");
      setNewTask({ name: "", cost: "", currency: "USD" });
      setShowTaskCreationForm(false);
    } catch (error) {
      console.error("Error creating task or attaching product:", error.message);
      console.log("Full error details:", error);
    }
  };

  
  const addTaskToProduct = async (task, product) => {
    console.log("Selected Product in addTaskToProduct:", product);

    console.log(selectedProduct)
    if (!product || !taskType) {
      console.error("No product selected or taskType not set.");
      console.log("Selected Product:", selectedOval);
      console.log("Task Type:", taskType);
      return;
    }
    
    try {
      console.log(`Creating context for task ${task.id} before adding it to product ${selectedProduct.id}`);
      
      // Step 1: Trigger context_id creation for the task
      const contextResponse = await axiosInstance.post(`/api/tasks/${task.id}/contexts`);
      const { context_id } = contextResponse.data;
  
      console.log(`Context created for task ${task.id}: ${context_id}`);
  
      // Step 2: Send the association to the backend
      console.log(`Adding task ${task.id} (context: ${context_id}) to ${taskType} settings for product ${setSelectedProduct.id}`);
      console.log(product)
      await axiosInstance.patch(`/api/tasks/${task.id}/contexts/${context_id}/products`, {
        product_id: product.id,
        instance_id: product.instance_id,
        type: taskType === "input" ? "output" : "input",
        action: "add",
      });
  
      console.log(`Task ${task.id} successfully added to ${taskType} settings with context ${context_id}.`);


  
      // Step 3: Update frontend state
      setAttachedTasks((prev) => [...prev, { ...task, context_id: context_id }]);
      setSettingsTableChanged((prev) => !prev); // Trigger reactivity
      setRelatedTasks((prev) => [...prev, { ...task, context_id: context_id }]);
      console.log(task, context_id)


  
      if (taskType === "input") {
        setOutputSettings((prev) => [...prev, { ...task, context_id: context_id }]);
      } else if (taskType === "output") {
        setInputSettings((prev) => [...prev, { ...task, context_id: context_id }]);
      }
  
     fetchTasksForProduct(taskType, product.id, product.instance_id, );
    
     console.log("Updated Related Tasks:", relatedTasks);


  
      // Step 4: Fetch updated task settings for the product
    } catch (error) {
      console.error(`Error adding task ${task.id} to ${taskType} settings:`, error.response?.data || error.message);
    }
  };
  

/*  
const addTaskToProduct = async (task) => {
  if (!selectedOval || !taskType) {
    console.error("No product selected or taskType not set.");
    console.log("Selected Product:", selectedOval);
    console.log("Task Type:", taskType);
    return;
  }

  try {
    console.log(`Adding task ${task.id} to ${taskType} settings for product ${selectedOval.id}`);

    // Send the association to the backend
    await axiosInstance.patch(`/api/tasks/${task.id}/products`, {
      product_id: selectedOval.id,
      type: taskType === "input" ? "output" : "input",
      action: "add",
    });


    console.log("This is the rectangle",rectangles)
    console.log(`Task ${task.id} successfully added to ${taskType} settings.`);
    setAttachedTasks((prev) => [...prev, task]);
    setSettingsTableChanged((prev) => !prev); // Trigger reactivity
    setRelatedTasks((prev) => [...prev, task]);



    if (taskType === "input") {
      setOutputSettings((prev) => [...prev, task]);
    } else if (taskType === "output") {
      setInputSettings((prev) => [...prev, task]);
    }
    fetchTasksForProduct(selectedOval.id, taskType);
  } catch (error) {
    console.error(`Error adding task ${task.id} to ${taskType} settings:`, error);
  }
};
 /* 
  const addProductToTask = async (autoAddTo = null) => {
    try {
    
      // Create the product
      const response = await axiosInstance.post("/api/products", newProduct);
  
      // Check the full product object returned by the backend
      const createdProduct = response.data;
      console.log("Product creation response:", createdProduct);
  
      fetchProducts();
  
      // If a task is selected, fetch its deployments
      if (selectedTask) fetchTaskDeployments(selectedTask.id);
  
      // Auto-add to input or output if required
      if (autoAddTo && selectedTask) {
        if (!createdProduct?.product_id) {
          console.error(
            "Cannot auto-add to input/output. Ensure createdProduct is valid.",
            { selectedTask: { id: selectedTask.id, name: selectedTask.name }, createdProduct }
          );
          return;
        }
  
        console.log(
          `Adding product ${createdProduct.product_id} as ${autoAddTo} for task ${selectedTask.id}`
        );
  
        await axiosInstance.patch(`/api/tasks/${selectedTask.id}/products`, {
          product_id: createdProduct.product_id,
          type: autoAddTo, // "input" or "output"
          action: "add",
        });
  
        // Refresh deployments dynamically
        fetchTaskDeployments(selectedTask.id);
      }
  
      // Reset the product form state
      setNewProduct({ name: "", creation_time: "", cost: "", currency: "USD" });
    } catch (error) {
      console.error("Error creating product or adding to input/output:", error.message);
    }
  };
  */

  const addProductToTask = async (autoAddTo = null) => {
    if (!selectedTask) {
      console.error("No task selected. Cannot proceed.");
      return;
    }
  
    const { id: taskId, context_id } = selectedTask;
  
    if (!context_id) {
      console.error("No context available for the selected task.");
      return;
    }
  
    try {
      console.log("Initiating product creation with:", newProduct);
  
      // Step 1: Create the product
      const response = await axiosInstance.post("/api/products", newProduct);
      const { product_id, message } = response.data;
  
      console.log("Product creation response:", response.data);
  
      if (!product_id) {
        console.error("Product creation failed. Backend response is invalid.");
        return;
      }
  
      console.log(`Product ${product_id} created successfully.`);
      const instanceResponse = await axiosInstance.post(`/api/products/${product_id}/instance`);
      const { instance_id } = instanceResponse.data;
  
      // Step 2: Prepare the full product object
      const createdProduct = {
        ...newProduct, // Use local product details
        id: product_id, // Use backend ID
        deployment_state: "V", // Default deployment state
        instance_id: instance_id
      };
  
      // Step 3: Update context settings dynamically
      if (autoAddTo) {
        console.log(`Adding product ${product_id} as ${autoAddTo} to task ${taskId}.`);



  
        await axiosInstance.patch(`/api/tasks/${taskId}/contexts/${context_id}/products`, {
          product_id,
          instance_id:instance_id,
          type: autoAddTo, // "input" or "output"
          action: "add",
        });
  
        console.log(`Product ${product_id} with ${instance_id} successfully added as ${autoAddTo}.`);
        
  
        // Update the context-specific settings
        const updateSettings = autoAddTo === "input" ? setContextInputSettings : setContextOutputSettings;
        updateSettings((prev) => {
          const currentSettings = prev[context_id] || [];
          return {
            ...prev,
            [context_id]: [...currentSettings, createdProduct],
          };
        });
  
        console.log(
          `Updated ${autoAddTo} settings for context ${context_id}:`,
          autoAddTo === "input" ? contextInputSettings : contextOutputSettings
        );
      }
  
      // Step 4: Reset the product form state
      setNewProduct({ name: "", creation_time: "", cost: "", currency: "USD" });
      console.log("Product form state reset.");
    } catch (error) {
      console.error(
        "Error during product creation or adding to input/output:",
        error.response?.data || error.message
      );
    }
  };
  
  
  
  

  // Function to toggle deployment status (V ↔ X)
  const toggleDeploymentStatus = async (productId, currentState) => {
  if (!selectedTask){
  console.error("No task selected")
  return;
  }

  const {id: taskId, context_id} = selectedTask;

  if (!context_id) {
    console.error("No context available for this task.")
    return;
  }

  const productWithInstance = (contextInputSettings[context_id] || []).find(
    (p) => p.id === productId
  );

  if (!productWithInstance) {
    console.error("Product not found in the output settings.");
    return;
  }

  const { instance_id } = productWithInstance

  try {
    const newState = currentState === "V" ? "X" : "V"; // Toggle state
      const payload ={
      product_id: productId,
      instance_id:instance_id,
      type: "input",
      action: "update_state",
      state: newState, // Update state in the backend
      };

      
      await axiosInstance.patch(`/api/tasks/${taskId}/contexts/${context_id}/products`, payload);

      setRefreshTrigger((prev) => prev + 1);

      setContextInputSettings((prev) => {
        const updatedContextInputSettings = (prev[context_id] || []).map((product) =>
          product.id === productId ? { ...product, deployment_state: newState } : product
        );
  
        return {
          ...prev,
          [context_id]: updatedContextInputSettings,
        };
    });

    // Update state locally for immediate feedback
    
    setDeployedInputProducts((prev) =>
    (contextInputSettings[context_id] || []).filter((p) => p.deployment_state === "V")
  );

   console.log(`Deployment status toggled for product ${productId} in context ${context_id}.`);
  } catch (error) {
    console.error(
      "Error toggling deployment status:",
      error.response?.data || error.message
    );
  }
};


const toggleOutputDeploymentStatus = async (productId, currentState) => {
  if (!selectedTask) {
    console.error("No task selected.");
    return;
  }

  const { id: taskId, context_id } = selectedTask;

  if (!context_id) {
    console.error("No context available for this task.");
    return;
  }
  const productWithInstance = (contextOutputSettings[context_id] || []).find(
    (p) => p.id === productId
  );

  if (!productWithInstance) {
    console.error("Product not found in the output settings.");
    return;
  }

  const { instance_id } = productWithInstance
  try {
    const newState = currentState === "V" ? "X" : "V"; // Toggle state

    // Ensure all required fields are included in the request payload
    const payload = {
      product_id: productId,
      instance_id: instance_id,
      type: "output",
      action: "update_state", // Optional: confirm with backend if this is needed
      state: newState,
    };

    await axiosInstance.patch(`/api/tasks/${taskId}/contexts/${context_id}/products`, payload);

    setRefreshTrigger((prev) => prev + 1);

    // Update state locally for the specific context
    setContextOutputSettings((prev) => {
      const updatedContextOutputSettings = (prev[context_id] || []).map((product) =>
        product.id === productId ? { ...product, deployment_state: newState } : product
      );

      return {
        ...prev,
        [context_id]: updatedContextOutputSettings,
      };
    });

    // Optionally update deployed products for the context
    setDeployedOutputProducts((prev) =>
      (contextOutputSettings[context_id] || []).filter((p) => p.deployment_state === "V")
    );

    console.log(`Deployment status toggled for product ${productId} in context ${context_id}.`);
  } catch (error) {
    console.error(
      "Error toggling deployment status:",
      error.response?.data || error.message
    );
  }
};

  
  
  const addInputTable = (product) => {
    // Add the product to the input settings table locally
    setInputSettings((prev) => [...prev, product]);
  
    // Persist the addition in the backend
    axiosInstance
      .patch(`/api/tasks/${selectedTask.id}/products`, {
        product_id: product.id,
        type: "input",
        state: "V", // Default state is "V"
      })
      .catch((error) => {
        console.error("Error adding product to input table:", error);
      });
  };
  

  const fetchDeployedProducts = async (taskId) => {
    try {
        const response = await axiosInstance.get(`/api/tasks/${taskId}/deployed-products`);
        return response.data || [];
    } catch (error) {
        console.error("Error fetching deployed products:", error);
        return [];
    }
};

  
  
// Function to delete a product from input settings table
const deleteFromSettingsTable = async (productId) => {
 
  if (!selectedTask) {
    console.error("No task selected for deleting the product.");
    return;
  }

  const { id: taskId, context_id } = selectedTask;

  if (!context_id) {
    console.error("No context available for this task.");
    return;
  }

  const productWithInstance = (contextInputSettings[context_id] || []).find(
    (p) => p.id === productId
  );

  if (!productWithInstance) {
    console.error("Product not found in the intput settings.");
    return;
  }

  const { instance_id } = productWithInstance

  try {
    // Make a POST request to the backend to delete the product
    await axiosInstance.patch(`/api/tasks/${taskId}/contexts/${context_id}/products`, {
      product_id: productId,
      instance_id: instance_id, // Pass the instance ID for this product
      type: "input",
      action: "delete",
    });

    setRefreshTrigger((prev) => prev + 1);

    // Update context-specific input settings locally
    setContextInputSettings((prev) => {
      const updatedSettings = (prev[context_id] || []).filter(
        (product) => product.id !== productId
      );
      return { ...prev, [context_id]: updatedSettings };
    });

    console.log(`Product ${productId} deleted from input settings for context ${context_id}.`);
  } catch (error) {
    console.error("Error deleting product from input settings table:", error.response?.data || error.message);
  }
};


const deleteFromOutputSettingsTable = async (productId) => {
  if (!selectedTask) return;


  const { id: taskId, context_id } = selectedTask;

  if (!context_id) {
    console.error("No context available for this task.");
    return;
  }
  
  const productWithInstance = (contextOutputSettings[context_id] || []).find(
    (p) => p.id === productId
  );

  if (!productWithInstance) {
    console.error("Product not found in the output settings.");
    return;
  }

  const { instance_id } = productWithInstance

  try {
    await axiosInstance.patch(`/api/tasks/${taskId}/contexts/${context_id}/products`, {
      product_id: productId,
      instance_id: instance_id,
      context_id:context_id,
      type: "output",  // Ensure this matches your backend validation
      action: "delete",  // Indicates a delete operation
    });

    setRefreshTrigger((prev) => prev + 1);
    // Update state locally
    setContextOutputSettings((prev) => {
      const updatedSettings = (prev[context_id] || []).filter(
        (product) => product.id !== productId
      );
      return { ...prev, [context_id]: updatedSettings };
    });

    console.log(`Product ${productId} deleted from output settings for context ${context_id}.`);
  } catch (error) {
    console.error("Error deleting product from output settings table:", error.response?.data || error.message);
  }
};


/*  

  const toggleProducts = async () => {
  console.log("Selected Task in toggleProducts before check:", selectedTask);

  if (!selectedTask) {
    console.warn("No task selected for showing input products");
    return;
  }

  console.log("Selected Task for input products:", selectedTask);

  const shouldShow = !showProducts
  try {
    const { deployed_input_products } = await fetchDeployedProducts(selectedTask.id);
    console.log("Fetched Input Products:", deployed_input_products);

    if (shouldShow) {
      const { deployed_input_products } = await fetchDeployedProducts(selectedTask.id);
      console.log("Fetched Input Products:", deployed_input_products);

      setDeployedInputProducts(deployed_input_products || []);
    }

    setShowProducts((prev) => !prev);
  } catch (error) {
    console.error("Error toggling deployed products:", error);
  }
};
*/
const deleteTaskFromProduct = async (taskId, productId) => {
  console.log(taskId, productId)
  if (!taskId || !productId) {
    console.error("Task ID or Product ID is missing");
    return;
  }

  try {
    // Send request to delete the relationship
    await axiosInstance.delete(`/api/tasks/${taskId}/products/${productId}`);
    console.log(`Deleted task ${taskId} from product ${productId}`);
    setRectangles((prev) => prev.filter((rect) => rect.id !== taskId));
    // Update the state to remove the task locally
    setRelatedTasks((prev) => prev.filter((task) => task.id !== taskId));
    setAttachedTasks((prev) => {
      console.log("Previous state in setAttachedTasks:", prev);
      if (!Array.isArray(prev)) {
        console.error("AttachedTasks is not an array. Resetting to an empty array.");
        return [];
      }
      return prev.filter((task) => task.id !== taskId && task.name.toLowerCase().includes(taskSearchQuery.toLowerCase()));
    });
    

    // Refresh the attached tasks dynamically
    const updatedRelatedTasks = relatedTasks.filter((task) => task.id !== taskId);
    const updatedAttachedTasks = updatedRelatedTasks.filter((task) =>
      task.name.toLowerCase().includes(taskSearchQuery.toLowerCase())
    );

    setRelatedTasks(updatedRelatedTasks); // Update the base list
    setAttachedTasks(updatedAttachedTasks); // Update the filtered list in the UI

    // Fetch updated tasks for the product
    fetchTasksForProduct( "input", productId,);
    fetchTasksForProduct("output", productId, );

    setRelatedTasks((prev) => prev.filter((task) => task.id !== taskId));

   
  } catch (error) {
    console.error("Error deleting task from product:", error.message);
  }
};

const fetchProductsForTask = async (taskId) => {
  try {
    const response = await axiosInstance.get(`/api/tasks/${taskId}/products`);
    console.log("Fetched products for task:", response.data);
    setTaskProducts(response.data || []); // Update the state for task's products
  } catch (error) {
    console.error("Error fetching products for task:", error.message);
  }
};
/*
const toggleProducts = async () => {
  console.log("Selected Task in toggleProducts before check:", selectedTask);

  if (!selectedTask) {
    console.warn("No task selected for toggling output products");
    return;
  }

  const shouldShow = !showProducts; // Determine the toggle state
  console.log("Toggling inpput products. Current state:", shouldShow);

  try {

    if (shouldShow){
    const response = await axiosInstance.get(`/api/tasks/${selectedTask.id}/contexts/${selectedTask.contextId}/products`);
    console.log("Full response from axios:", response);

    // Extract the data
    const { input_products } = response.data;
    if (!input_products || !Array.isArray(input_products)) {
      console.warn("No output products found or invalid format:", input_products);
      setSelectedProduct([]); // Clear products if no valid output_products found
      return;
    }

    console.log("Extracted output products:", input_products);

    // Filter and map products to include only those with deployment_state === 'V'
    const filteredProducts = input_products
      .filter((product) => product.deployment_state === "V")
      .map((product) => ({
        ...product,
        side: "left", // Add side property
      }));

    // Set the fetched and filtered products as selected
    setSelectedProduct(filteredProducts);
    console.log("Selected output products set:", filteredProducts);
    }else {
      setSelectedProduct([]);
      console.log("selected input products cleared.")
    }
    // Update the visibility toggle
    setShowProducts(shouldShow);
  } catch (error) {
    console.error("Error toggling output products:", error);
  }
};
*/

const updateChainWithNewProducts = (products, connections, toggleSide) => {
  setChain((prevChain) => {
    const updatedChain = prevChain.filter(
      (node) => !(node.type === "product" && node.context_id === selectedTask.context_id)
    );
    return [...updatedChain, ...products];
  });

  setConnections((prevConnections) => {
    const updatedConnections = prevConnections.filter(
      (conn) =>
        !products.some(
          (product) => conn.to.x === product.x && conn.to.y === product.y + 25
        )
    );

    return [...updatedConnections, ...connections];
  });
};

const updateConnections = () => {
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


const toggleProducts = async () => {
  console.log("Selected Task in toggleProducts:", selectedTask);

  if (!selectedTask) {
    console.warn("No task selected for toggling input products.");
    return;
  }

  const shouldShowInput = !showProducts; // Independent toggle state for input products
  console.log("Toggling input products. Current state:", shouldShowInput);

  try {
    if (shouldShowInput) {
      const response = await axiosInstance.get(
        `/api/tasks/${selectedTask.id}/contexts/${selectedTask.context_id}/products`
      );
      const { input_products } = response.data;

      const filteredProducts = input_products
        .filter((product) => product.deployment_state === "V")
        .map((product, index) => ({
          ...product,
          type: "product",
          x: selectedTask.x - 250, // Input products to the left
          y: selectedTask.y + index * 70,
          context_id: selectedTask.context_id,
          key: `${selectedTask.context_id}-input-${product.instance_id}`,
        }));

      setChain((prevChain) => {
        const updatedChain = prevChain.filter(
          (node) =>
            !(node.type === "product" && node.context_id === selectedTask.context_id && node.key?.includes("input"))
        );
        return [...updatedChain, ...filteredProducts];
      });

      setConnections((prevConnections) => {
        const newConnections = filteredProducts.map((product) => ({
          from: { x: product.x + 75, y: product.y + 30 },
          to: { x: selectedTask.x - 10, y: selectedTask.y + 30 },
        }));
        return [...prevConnections, ...newConnections];
      });

      console.log("Input products added to chain:", filteredProducts);

      if (filteredProducts.length > 0) {
        setSelectedProduct(filteredProducts[0]);
        console.log("Selected Product updated:", filteredProducts[0]);
      }
    } else {
      // Clear input products and their connections
      setChain((prevChain) =>
        prevChain.filter(
          (node) =>
            !(node.type === "product" && node.context_id === selectedTask.context_id && node.key?.includes("input"))
        )
      );

      setConnections((prevConnections) =>
        prevConnections.filter(
          (conn) =>
            !chain.some(
              (node) =>
                node.type === "product" &&
                node.context_id === selectedTask.context_id &&
                node.key?.includes("input") &&
                conn.from.x === node.x + 75 &&
                conn.from.y === node.y + 30
            )
        )
      );

      console.log("Input products and connections cleared.");
    }
    
    setShowProducts(shouldShowInput); // Update toggle state

    setChain((prevChain) =>
      prevChain.map((node) =>
        node.id === selectedTask.id
          ? { ...node, showInputProducts: shouldShowInput }
          : node
      )
    );
  } catch (error) {
    console.error("Error toggling input products:", error);
  }
};



const toggleProductsRight = async () => {
  console.log("Selected Task in toggleProductsRight:", selectedTask);

  if (!selectedTask) {
    console.warn("No task selected for toggling output products.");
    return;
  }

  const shouldShowRight = !showProductsRight; // Independent toggle state for output products
  console.log("Toggling output products. Current state:", shouldShowRight);

  try {
    if (shouldShowRight) {
      const response = await axiosInstance.get(
        `/api/tasks/${selectedTask.id}/contexts/${selectedTask.context_id}/products`
      );
      const { output_products } = response.data;

      if (!output_products || !Array.isArray(output_products)) {
        console.warn("No output products found or invalid format:", output_products);
        return;
      }
      console.log("Extracted output products:", output_products);

      const filteredProducts = output_products
        .filter((product) => product.deployment_state === "V")
        .map((product, index) => ({
          ...product,
          type: "product",
          x: selectedTask.x + 150, // Output products to the right
          y: selectedTask.y + index * 70,
          context_id: selectedTask.context_id,
          key: `${selectedTask.context_id}-output-${product.instance_id}`,
        }));

      setChain((prevChain) => {
        const updatedChain = prevChain.filter(
          (node) =>
            !(node.type === "product" && node.context_id === selectedTask.context_id && node.key?.includes("output"))
        );
        return [...updatedChain, ...filteredProducts];
      });

      // Automatically set the first output product as the selected product
      if (filteredProducts.length > 0) {
        setSelectedProduct(filteredProducts[0]);
        console.log("Selected Product updated:", filteredProducts[0]);
      }

      setConnections((prevConnections) => {
        const newConnections = filteredProducts.map((product) => ({
          from: { x: selectedTask.x + 60, y: selectedTask.y + 30 },
          to: { x: product.x + 75, y: product.y + 30 },
        }));
        return [...prevConnections, ...newConnections];
      });

      console.log("Output products added to chain:", filteredProducts);
    } else {
      // Clear output products and their connections
      setChain((prevChain) =>
        prevChain.filter(
          (node) =>
            !(node.type === "product" && node.context_id === selectedTask.context_id && node.key?.includes("output"))
        )
      );

      setConnections((prevConnections) =>
        prevConnections.filter(
          (conn) =>
            !chain.some(
              (node) =>
                node.type === "product" &&
                node.context_id === selectedTask.context_id &&
                node.key?.includes("output") &&
                conn.to.x === node.x + 75 &&
                conn.to.y === node.y + 30
            )
        )
      );

      console.log("Output products and connections cleared.");
    }

    setShowProductsRight(shouldShowRight); // Update toggle state
    setTimeout(() => updateConnections(), 0); // Ensure connections are updated after chain state changes

  } catch (error) {
    console.error("Error toggling output products:", error);
  }
};

const refreshProducts = async () => {
  if (!selectedTask) {
    console.warn("No task selected for refreshing input products.");
    return;
  }

  try {
    const response = await axiosInstance.get(
      `/api/tasks/${selectedTask.id}/contexts/${selectedTask.context_id}/products`
    );
    const { input_products } = response.data;

    const filteredProducts = input_products
      .filter((product) => product.deployment_state === "V")
      .map((product, index) => ({
        ...product,
        type: "product",
        x: selectedTask.x - 250, // Input products to the left
        y: selectedTask.y + index * 70,
        context_id: selectedTask.context_id,
        key: `${selectedTask.context_id}-input-${product.instance_id}`,
      }));

      if (filteredProducts.length > 0) {
        setSelectedProduct(filteredProducts[0]);
        console.log("Selected Product updated:", filteredProducts[0]);
      }
    setChain((prevChain) => {
      const updatedChain = prevChain.filter(
        (node) =>
          !(node.type === "product" && node.context_id === selectedTask.context_id && node.key?.includes("input"))
      );
      return [...updatedChain, ...filteredProducts];
    });

    setConnections((prevConnections) => {
      const newConnections = filteredProducts.map((product) => ({
        from: { x: product.x + 75, y: product.y + 30 },
        to: { x: selectedTask.x - 10, y: selectedTask.y + 30 },
      }));
      return [...prevConnections, ...newConnections];
    });

    console.log("Input products refreshed:", filteredProducts);
  } catch (error) {
    console.error("Error refreshing input products:", error);
  }
};

const refreshProductsRight = async () => {
  if (!selectedTask) {
    console.warn("No task selected for refreshing output products.");
    return;
  }

  try {
    const response = await axiosInstance.get(
      `/api/tasks/${selectedTask.id}/contexts/${selectedTask.context_id}/products`
    );
    const { output_products } = response.data;

    const filteredProducts = output_products
      .filter((product) => product.deployment_state === "V")
      .map((product, index) => ({
        ...product,
        type: "product",
        x: selectedTask.x + 150, // Output products to the right
        y: selectedTask.y + index * 70,
        context_id: selectedTask.context_id,
        key: `${selectedTask.context_id}-output-${product.instance_id}`,
      }));
      if (filteredProducts.length > 0) {
        setSelectedProduct(filteredProducts[0]);
        console.log("Selected Product updated:", filteredProducts[0]);
      }
    setChain((prevChain) => {
      const updatedChain = prevChain.filter(
        (node) =>
          !(node.type === "product" && node.context_id === selectedTask.context_id && node.key?.includes("output"))
      );
      return [...updatedChain, ...filteredProducts];
    });

    setConnections((prevConnections) => {
      const newConnections = filteredProducts.map((product) => ({
        from: { x: selectedTask.x + 60, y: selectedTask.y + 30 },
        to: { x: product.x + 75, y: product.y + 30 },
      }));
      return [...prevConnections, ...newConnections];
    });

    console.log("Output products refreshed:", filteredProducts);
  } catch (error) {
    console.error("Error refreshing output products:", error);
  }
};



const toggleTaskDeploymentStatus = async (id, currentState, type) => {
  const newState = currentState === "V" ? "X" : "V";

  try {
    const response = await axiosInstance.patch(
      `/api/products/${selectedProduct.id}/instance/${selectedProduct.instance_id}/tasks`,
      {
        task_id: id,
        state: newState,
        type: type, // "input" or "output"
        action: "update",
      }
    );

    console.log(response.data.message);

    // Update the local state
    if (type === "input") {
      setContextInputTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, deployment_state: newState } : task
        )
      );
    } else if (type === "output") {
      setContextOutputTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, deployment_state: newState } : task
        )
      );
    }
  } catch (error) {
    console.error("Error toggling task deployment status:", error);
  }
};

const toggleTasks = async (selectedProduct) => {
  console.log("Selected Product in toggleTasks:", selectedProduct);

  if (!selectedProduct) {
    console.warn("No product selected for toggling input tasks.");
    return;
  }

  const shouldShow = !selectedProduct.showInputTasks;
  console.log("Toggling input tasks. Current state:", shouldShow);

  try {
    if (shouldShow) {
      // Fetch input tasks
      const response = await axiosInstance.get(
        `/api/products/${selectedProduct.id}/instance/${selectedProduct.instance_id}/tasks`,
        { params: { type: "input" } }
      );
      console.log("API response for input tasks:", response.data);

      const inputTasks = response.data
        .filter((task) => task.deployment_state === "V")
        .map((task, index) => ({
          ...task,
          type: "task",
          x: selectedProduct.x - 150, // Position input tasks to the left
          y: selectedProduct.y + index * 70,
          key: `${selectedProduct.id}-${task.context_id}-input`,
        }));

      // Update chain
      setChain((prevChain) => {
        const updatedChain = prevChain.filter(
          (node) => !(node.type === "task" && node.context_id === selectedProduct.context_id && node.key?.includes("input"))
        );
        return [...updatedChain, ...inputTasks];
      });

      if (inputTasks.length > 0) {
        setSelectedTask(inputTasks[0]);
        console.log("Updated selectedTask:", inputTasks[0]);
      } else {
        setSelectedTask(null);
        console.warn("No output tasks available to select.");
      }

      // Update connections
      setConnections((prevConnections) => {
        const newConnections = inputTasks.map((task) => ({
          from: { x: selectedProduct.x - 10, y: selectedProduct.y + 30 },
          to: { x: task.x + 45, y: task.y + 30 },
        }));
        return [...prevConnections, ...newConnections];
      });

      console.log("Input tasks added to chain:", inputTasks);
    } else {
      // Remove input tasks and connections
      setChain((prevChain) =>
        prevChain.filter(
          (node) => !(node.type === "task" && node.context_id === selectedProduct.context_id && node.key.includes("input"))
        )
      );
      setConnections((prevConnections) =>
        prevConnections.filter(
          (conn) =>
            !chain.some(
              (node) =>
                node.type === "task" &&
                node.context_id === selectedProduct.context_id &&
                node.key.includes("input") &&
                conn.to.x === node.x &&
                conn.to.y === node.y + 30
            )
        )
      );

      console.log("Input tasks removed from chain.");
    }

    // Update showInputTasks state
    setChain((prev) =>
      prev.map((node) =>
        node.id === selectedProduct.id
          ? { ...node, showInputTasks: shouldShow }
          : node
      )
    );
  } catch (error) {
    console.error("Error toggling input tasks:", error);
  }
};



const toggleTasksRight = async (selectedProduct) => {
  console.log("Selected Product in toggleTasksRight:", selectedProduct);

  if (!selectedProduct || !selectedProduct.id || !selectedProduct.instance_id) {
    console.warn("No valid product selected for toggling output tasks.");
    return;
  }

  const shouldShow = !selectedProduct.showOutputTasks; // Determine toggle state
  console.log("Toggling output tasks. Current state:", shouldShow);

  try {
    if (shouldShow) {
      // Fetch output tasks from the backend
      const response = await axiosInstance.get(
        `/api/products/${selectedProduct.id}/instance/${selectedProduct.instance_id}/tasks`,
        { params: { type: "output" } }
      );
      console.log("API response for output tasks:", response.data);

      const outputTasks = response.data
        .filter((task) => task.deployment_state === "V") // Only include deployed tasks
        .map((task, index) => ({
          ...task,
          type: "task",
          x: selectedProduct.x + 250, // Position to the right of the product
          y: selectedProduct.y + index * 70, // Stack tasks vertically
          key: `${selectedProduct.id}-${task.context_id}-output`,
        }));

      // Update the `chain` with the new tasks
      setChain((prevChain) => {
        console.log("Current Chain:", prevChain);
        const updatedChain = prevChain.filter(
          (node) =>
            !(node.type === "task" &&
              node.context_id === selectedProduct.context_id &&
              node.key?.includes("output"))
        );
        return [...updatedChain, ...outputTasks];
      });

      // Set the `selectedTask` to the first output task if it exists
      if (outputTasks.length > 0) {
        setSelectedTask(outputTasks[0]);
        console.log("Updated selectedTask:", outputTasks[0]);
      } else {
        setSelectedTask(null);
        console.warn("No output tasks available to select.");
      }

      // Update connections
      setConnections((prevConnections) => {
        const newConnections = outputTasks.map((task) => ({
          from: { x: selectedProduct.x + 110, y: selectedProduct.y + 30 },
          to: { x: task.x + 45, y: task.y + 30 },
        }));
        return [...prevConnections, ...newConnections];
      });

      console.log("Output tasks added to chain:", outputTasks);
    } else {
      // Remove output tasks and connections
      setChain((prevChain) =>
        prevChain.filter(
          (node) =>
            !(node.type === "task" &&
              node.context_id === selectedProduct.context_id &&
              node.key.includes("output"))
        )
      );

      setConnections((prevConnections) =>
        prevConnections.filter(
          (conn) =>
            !chain.some(
              (node) =>
                node.type === "task" &&
                node.context_id === selectedProduct.context_id &&
                node.key.includes("output") &&
                conn.to.x === node.x &&
                conn.to.y === node.y + 30
            )
        )
      );

      console.log("Output tasks removed from chain.");
    }

    // Update the `showOutputTasks` state
    setChain((prev) =>
      prev.map((node) =>
        node.id === selectedProduct.id
          ? { ...node, showOutputTasks: shouldShow }
          : node
      )
    );
  } catch (error) {
    console.error("Error toggling output tasks:", error);
  }
};

const fetchTaskProducts = async (taskId, contextId) => {
  try {
    console.log(`Fetching products for task ${taskId} and context ${contextId}`);
    const response = await axiosInstance.get(`/api/tasks/${taskId}/contexts/${contextId}/products`);
    const { input_products, output_products } = response.data;
    console.log("Fetched Input Products:", input_products);
    console.log("Fetched Output Products:", output_products);
    return { inputProducts: input_products, outputProducts: output_products };
  } catch (error) {
    console.error("Error fetching task products:", error);
    return { inputProducts: [], outputProducts: [] }; // Fallback to empty arrays
  }
};

const toggleSettings = async () => {
  console.log(selectedTask)
  if (!selectedTask) {
    console.warn("No task selected for input settings.");
    return;
  }

  console.log("Toggling Input Settings for Task:", selectedTask);


  try {
    const { inputProducts } = await fetchTaskProducts(selectedTask.id, selectedTask.context_id);
    setContextInputSettings((prev) => ({
      ...prev,
      [selectedTask.context_id]: inputProducts, // Dynamically update input products for the context
    }));
    console.log("Updated Input Settings for Context:", inputProducts);
    setShowSettings((prev) => !prev);
  } catch (error) {
    console.error("Error toggling input settings:", error);
  }
};

const toggleSettingsRight = async () => {
  if (!selectedTask) {
    console.warn("No task selected for output settings.");
    return;
  }

  console.log("Toggling Output Settings for Task:", selectedTask);

  try {
    const { outputProducts } = await fetchTaskProducts(selectedTask.id, selectedTask.context_id);
    setContextOutputSettings((prev) => ({
      ...prev,
      [selectedTask.context_id]: outputProducts, // Dynamically update output products for the context
    }));
    console.log("Updated Output Settings for Context:", outputProducts);
    setShowSettingsRight((prev) => !prev);
  } catch (error) {
    console.error("Error toggling output settings:", error);
  }
};


  
  return (
    <div className="app-container">
      <h1>Interactive Task and Product Diagram</h1>


      <CurrentTaskTable tasks={tasks}
      newTask={newTask}
      setNewTask={setNewTask} 

      handleTaskCreation={handleTaskCreation}
      />
      <CurrentProductTable 
      products={products} 

      handleProductCreation={handleProductCreation}
      />

      <CreationForms
              newTask={newTask}
              setNewTask={setNewTask}
              handleTaskCreation={handleTaskCreation}
              newProduct={newProduct}
              setNewProduct={setNewProduct}
              handleProductCreation={handleProductCreation}
              showTaskForm={showTaskForm}
              setShowTaskForm={setShowTaskForm}
              showProductForm={showProductForm}
              setShowProductForm={setShowProductForm}
              
            />

      
      <MegaTaskWindow_v2
        showMegaTask={showMegaTask}
        setShowMegaTask={setShowMegaTask}
        tasks={tasks}
        products={products}
        selectedTask={selectedTask}
        deployedInputProducts={deployedInputProducts}
        deployedOutputProducts={deployedOutputProducts}
        showProducts={showProducts}
        showProductsRight={showProductsRight}
        setSelectedOval={setSelectedOval}
        toggleSettings={toggleSettings} // Ensure this is passed
        toggleSettingsRight={toggleSettingsRight} // Ensure this is passed
        showSettings={showSettings} // Ensure this is passed
        showSettingsRight={showSettingsRight} // Ensure this is passed
        inputSettings={inputSettings}
        outputSettings={outputSettings}
        handleSettingsSearch={handleSettingsSearch}
        toggleDeploymentStatus={toggleDeploymentStatus}
        taskSearchQuery={taskSearchQuery}
        settingsSearchQuery={settingsSearchQuery}
        filteredProducts={filteredProducts}
        addToSettingsTable={addToSettingsTable}
        handleProductCreation = {handleProductCreation}
        searchQueryOutput={searchQueryOutput}
        addToSettingsTableright={addToSettingsTableright}
        setFilteredProducts ={setFilteredProducts}
        setSearchQuery = {setSearchQuery}
        selectedProduct = {selectedProduct}
        newProduct={newProduct}
        handleOutputSettingsSearch={handleOutputSettingsSearch}
        deleteFromSettingsTable={deleteFromSettingsTable}
        setSelectedTask={setSelectedTask}
        setShowCreateProduct={setShowCreateProduct}
        showCreateProduct={showCreateProduct}
        showCreateOutputProduct={showCreateOutputProduct}
        setNewProduct={setNewProduct}
        handleInputProductCreation={handleInputProductCreation}
        setShowCreateOutputProduct={setShowCreateOutputProduct}
        handleOutputProductCreation={handleOutputProductCreation}
        deleteFromOutputSettingsTable={deleteFromOutputSettingsTable}
        toggleOutputDeploymentStatus={toggleOutputDeploymentStatus}
        selectedOval = {selectedOval} 
        setShowTaskSettings={setShowTaskSettings}  
        fetchTasksForProduct={fetchTasksForProduct} 
        setSelectedProduct={setSelectedProduct}  
        setTaskType={setTaskType}
        handleTaskCreationauto={handleTaskCreationauto}
        showTaskCreationForm={showTaskCreationForm}
        setShowTaskCreationForm={setShowTaskCreationForm}
        filteredAttachedTasks = {filteredAttachedTasks} 
        attachedTasks={attachedTasks}
        filteredTasks = {filteredTasks}
        handleTaskSearch={handleTaskSearch}
        setNewTask={setNewTask}
        fetchTasks = {fetchTasks}
        newTask={newTask}
        showTaskSettings={showTaskSettings}
        setTaskSearchQuery={setTaskSearchQuery}
        setFilteredTasks ={setFilteredTasks}
        addTaskToProduct={addTaskToProduct}
        taskType={taskType}
        settingsTableChanged = {settingsTableChanged}
        setSettingsTableChanged = {setSettingsTableChanged} 
        setTaskProducts = {setTaskProducts}
        deleteTaskFromProduct={deleteTaskFromProduct}
        setAttachedTasks={setAttachedTasks}
        setRelatedTasks = {setRelatedTasks}
        relatedTasks = {relatedTasks}
        fetchChain={fetchChain}
        setRectangles={setRectangles}
        rectangles = {rectangles}
        handleTaskSelection={handleTaskSelection}
        contextOutputSettings={contextOutputSettings}
        contextInputSettings={contextInputSettings}
        addProductToTask = {addProductToTask}
        handleProductSelection={handleProductSelection}  
        toggleProductsRight={toggleProductsRight}  
        toggleProducts={toggleProducts} 
        chain={chain}
        setChain={setChain}
        connections={connections}
        setConnections={setConnections}
        toggleTaskDeploymentStatus = {toggleTaskDeploymentStatus}
        toggleTasks = {toggleTasks}
        toggleTasksRight = {toggleTasksRight}
        fetchProducts={fetchProducts}
        fetchUpdates = {fetchUpdates}
   

      />
    </div>
    
    
  )
}


export default App;