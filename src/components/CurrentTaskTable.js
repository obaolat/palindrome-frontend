import { useState } from "react";
import { motion } from "framer-motion";
import "../style/CurrentTaskTable.css";

const CurrentTaskTable = ({ tasks = [], handleTaskCreation }) => {
  const [showCurrentTaskTable, setShowCurrentTaskTable] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [showTaskCreationForm, setShowTaskCreationForm] = useState(false);
  const [localTask, setLocalTask] = useState({
    name: "",
    start_time: "",
    end_time: "",
    cost: "",
    currency: "USD",
  });

  // Filter tasks based on the search query and remove invalid entries
  const filteredTasks = tasks
    .filter((task) => task && task.name) // Ensure task and task.name exist
    .filter((task) =>
      task.name.toLowerCase().includes(taskSearchQuery.toLowerCase())
    );

  return (
    <div className="current-task-table-container">
      <button
        className="toggle-current-task-table-btn"
        onClick={() => setShowCurrentTaskTable((prev) => !prev)}
      >
        {showCurrentTaskTable
          ? "Hide Current Task Table"
          : "View Current Task Table"}
      </button>

      {showCurrentTaskTable && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="current-task-table-wrapper"
        >
          <div className="current-task-table-header">
            <input
              type="text"
              className="current-task-search-input"
              placeholder="Search Task Names..."
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
            />
            <button
              className="create-task-toggle-btn"
              onClick={() => setShowTaskCreationForm((prev) => !prev)}
            >
              {showTaskCreationForm ? "Close Task Form" : "Create Task"}
            </button>
          </div>

          <div className="current-task-table-body">
            <table className="current-task-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Cost (Currency)</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task, index) => (
                    <tr key={index}>
                      <td>{task.name}</td>
                      <td>
                        {task.cost || "N/A"} ({task.currency || "N/A"})
                      </td>
                      <td>{task.start_time || "N/A"}</td>
                      <td>{task.end_time || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No tasks found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {showTaskCreationForm && (
        <>
          <motion.div
            className="task-creation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTaskCreationForm(false)}
          ></motion.div>
          <motion.div
            className="task-creation-form-popup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2>Create Task</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Local Task before submission:", localTask);
                handleTaskCreation(localTask); // Pass local state to parent handler
                setShowTaskCreationForm(false); // Close form after submission
                setLocalTask({
                  name: "",
                  start_time: "",
                  end_time: "",
                  cost: "",
                  currency: "USD",
                }); // Reset local state
              }}
            >
              <input
                type="text"
                placeholder="Task Name"
                value={localTask.name}
                onChange={(e) =>
                  setLocalTask({ ...localTask, name: e.target.value })
                }
                required
              />
              <input
                type="datetime-local"
                placeholder="Start Time"
                value={localTask.start_time}
                onChange={(e) =>
                  setLocalTask({ ...localTask, start_time: e.target.value })
                }
                required
              />
              <input
                type="datetime-local"
                placeholder="End Time"
                value={localTask.end_time}
                onChange={(e) =>
                  setLocalTask({ ...localTask, end_time: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Cost"
                value={localTask.cost}
                onChange={(e) =>
                  setLocalTask({ ...localTask, cost: e.target.value })
                }
                required
              />
              <select
                value={localTask.currency}
                onChange={(e) =>
                  setLocalTask({ ...localTask, currency: e.target.value })
                }
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <button type="submit">Create Task</button>
            </form>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CurrentTaskTable;
