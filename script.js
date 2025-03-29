//Dom Elements
const addTaskBtn = document.getElementById("addTaskBtn");
const modalBox = document.getElementById("modal-box");
const modalContent = document.getElementById("modal-content");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskBodyTable = document.getElementById("taskBodyTable");
const prioritySelect = document.getElementById("taskPriority");
const statusSelect = document.getElementById("taskStatus");
const overlay = document.getElementById("overlay");
const detailModal = document.getElementById("detailModal");
const closeShowModal = document.getElementById("closeShowModal");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const filterBtn = document.getElementById("filterBtn");
const filterType = document.getElementById("filterType");
const filterDetails = document.getElementById("filterDetails");

//Global Variables
let isEditing = false;
let editingId = null;
let isLoading = false;

let toDo = []; // Array holding all tasks
let foundedTasks = []; // Array holding filtered tasks

let currentPage = 1; // Current page for pagination
let tasksPerPage = 3; // Number of tasks per page for pagination

// Event Listener for Open Add Task Modal
addTaskBtn.addEventListener("click", () => {
  isEditing = false;
  clearModalInputs();

  openModal(modalBox, modalContent);

  document.addEventListener("keydown", enterKey);
});

// Function Save Task on Enter Key
function enterKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveTaskBtn.click();
  }
}

// Event Listener for Close Modal
closeModalBtn.addEventListener("click", () => {
  closeModal(modalBox, modalContent);

  isEditing = false;
  editingId = null;

  saveTaskBtn.innerHTML = "Save";

  showToast("Operation Canceled", "info");
});

// Fetch tasks from the API and render them
function getTasks() {
  fetch("https://676d4ea00e299dd2ddff1999.mockapi.io/Tasks")
    .then((response) => response.json())
    .then((result) => {
      toDo = result; // Assign the fetched tasks to the global 'toDo' array
      foundedTasks = [...toDo]; // Create a copy of the tasks for search and filtering purposes
      renderTasks(foundedTasks);
    })
    .catch((err) => console.log(err));
}

// Render tasks
function renderTasks(tasks) {
  taskBodyTable.innerHTML = ""; // Clear the current task table

  // Calculate the tasks to be displayed on the current page
  const start = (currentPage - 1) * tasksPerPage;
  const end = start + tasksPerPage;
  const paginatedTasks = tasks.slice(start, end);

  // Display a message if no tasks are found
  if (foundedTasks.length === 0) {
    taskBodyTable.innerHTML =
      "<tr><td colspan='5' class='text-center'>No tasks found.</td></tr>";
  }

  paginatedTasks.forEach((todo) => {
    let priorityColor = ""; // Define a variable for task priority color

    // Set the color based on the task's priority
    switch (todo.taskPriority) {
      case "Low":
        priorityColor = "bg-gray-200";
        break;
      case "Medium":
        priorityColor = "bg-yellow-400";
        break;
      case "High":
        priorityColor = "bg-red-500 text-white";
        break;
    }

    let statusColor = ""; // Define a variable for task status color

    // Set the color based on the task's status
    switch (todo.taskStatus) {
      case "ToDo":
        statusColor = "bg-red-500 text-white";
        break;
      case "Doing":
        statusColor = "bg-yellow-400";
        break;
      case "Done":
        statusColor = "bg-green-600 text-white";
        break;
    }

    // Define the content for the deadline column
    const deadlineContent = todo.taskDeadLine
      ? `<div class="border border-blue-500 rounded-xl p-2">${todo.taskDeadLine}</div>`
      : "-";

    // Define the content for the priority column
    const priorityContent =
      todo.taskPriority === "Choose"
        ? "-"
        : ` <span class="px-6 py-1 rounded-2xl ${priorityColor}">${todo.taskPriority}</span>`;

    // Define the content for the status column
    const statusContent =
      todo.taskStatus === "Choose"
        ? "-"
        : `<span class="px-6 py-1 rounded-2xl ${statusColor}">${todo.taskStatus}</span>`;

    // Append a new row to the task table for the current task
    taskBodyTable.innerHTML += `
        <tr>
          <td class="text-left p-4 border">${todo.taskName}</td>

          <td class="text-center py-4 border">
           ${priorityContent}
          </td>

          <td class="text-center py-4 border">
            ${statusContent}
          </td>

          <td class="text-center justify-items-center border">${deadlineContent}</td>

          <td class="text-center px-4 border">
            <div class="flex gap-2 justify-center">
              <button onclick="deleteTask('${todo.id}')">
                <img src="./assets/images/delete.svg" alt="delete" class="w-7 min-w-[16px] rounded-lg hover:scale-110 transition duration-200 ease-in">
              </button>
              <button onclick="editTask('${todo.id}')">
                <img src="./assets/images/edit.svg" alt="edit" class="w-7 min-w-[16px] rounded-lg hover:scale-110 transition duration-200 ease-in">
              </button>
              <button onclick="showDetail('${todo.id}')">
                <img src="./assets/images/show.svg" alt="showDetail" class="w-7 min-w-[16px] rounded-lg hover:scale-110 transition duration-200 ease-in">
              </button>
            </div>
          </td>
          
        </tr>
      `;
  });
  renderPagination(tasks);
}

// Add event listener for the "Previous Page" button
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTasks(foundedTasks);
  }
});

// Add event listener for the "Next Page" button
document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(foundedTasks.length / tasksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTasks(foundedTasks);
  }
});

// Function to handle pagination rendering
function renderPagination(tasks) {
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  const prevButton = document.getElementById("prevPage"); // Get the "Previous Page" button element

  prevButton.disabled = currentPage === 1; // Disable the "Previous Page" button if on the first page

  const nextButton = document.getElementById("nextPage"); // Get the "Next Page" button element

  nextButton.disabled =
    currentPage === totalPages || tasks.length <= tasksPerPage; // Disable the "Next Page" button if on the last page or if there are no tasks to paginate

  document.getElementById("currentPage").textContent = currentPage; // Update the current page number display
}

// Add event listener for the Save Task button
saveTaskBtn.addEventListener("click", async () => {
  // Get input values for the task
  const taskName = document.getElementById("taskName").value.trim();
  const taskPriority = document.getElementById("taskPriority").value;
  const taskStatus = document.getElementById("taskStatus").value;
  let taskDeadLine = document.getElementById("taskDeadLine").value;
  let taskDetails = document.getElementById("taskDetails").value.trim();

  updatePriorityAndStatusColors(taskPriority, taskStatus);

  if (taskName) {
    isLoading = true;
    loadingModal();

    try {
      // Create the task data object
      let taskData = {
        taskName,
        taskPriority,
        taskStatus,
        taskDeadLine,
        taskDetails,
      };

      if (isEditing) {
        const res = await fetch(
          `https://676d4ea00e299dd2ddff1999.mockapi.io/Tasks/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData), // Send the task data in the request body
          }
        );
        if (res.ok) {
          showToast("Task updated successfully!", "info");
          saveTaskBtn.innerHTML = "Save"; // Reset the button text
          editingId = null; // Clear the editing ID

          filterDetails.classList.add("hidden"); // Hide filter details
          filterType.value = "Select Filter"; // Reset filter type
        }
      } else {
        const res = await fetch(
          "https://676d4ea00e299dd2ddff1999.mockapi.io/Tasks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData), // Send the task data in the request body
          }
        );
        if (res.ok) {
          showToast("Task added successfully!", "success");

          // Update pagination to the last page
          const totalTasks = toDo.length + 1;
          currentPage = Math.ceil(totalTasks / tasksPerPage);
        }
      }

      // Refresh the task list by Get new task
      getTasks();
      clearModalInputs();

      modalBox.classList.add("hidden"); // Hide the modal

      // Reset loading state
      isEditing = false;
      editingId = null;

      isLoading = false;
      loadingModal();
      modalContent.style.display = "flex"; // Restore modal content visibility
    } catch (error) {
      console.error(error); // Handle errors during task saving
      showToast("Error saving task", "error");
    }
  }
  // Highlight the empty input field and show an alert for adding task
  if (taskName === "") {
    document.getElementById("taskName").classList.add("border-red-500");
    alert("Please add your Task.");
    return;
  } else {
    document.getElementById("taskName").classList.remove("border-red-500"); // Remove the highlighted border if the task name is not empty
  }
});

// Add an event listener to the priority section to update its colors on change
prioritySelect.addEventListener("change", () => {
  updatePriorityAndStatusColors(prioritySelect.value, statusSelect.value);
});

// Add an event listener to the status section to update its colors on change
statusSelect.addEventListener("change", () => {
  updatePriorityAndStatusColors(prioritySelect.value, statusSelect.value);
});

function updatePriorityAndStatusColors(taskPriority, taskStatus) {
  // Remove existing color classes from priority section and status section
  prioritySelect.classList.remove(
    "text-green-500",
    "text-yellow-500",
    "text-red-500"
  );
  statusSelect.classList.remove(
    "text-green-500",
    "text-yellow-500",
    "text-red-500"
  );

  // Apply color classes based on the selected task priority
  switch (taskPriority) {
    case "Low":
      prioritySelect.classList.add("text-green-500");
      break;
    case "Medium":
      prioritySelect.classList.add("text-yellow-500");
      break;
    case "High":
      prioritySelect.classList.add("text-red-500");
      break;
    default:
      break;
  }

  // Apply color classes based on the selected task status
  switch (taskStatus) {
    case "ToDo":
      statusSelect.classList.add("text-red-500");
      break;
    case "Doing":
      statusSelect.classList.add("text-yellow-500");
      break;
    case "Done":
      statusSelect.classList.add("text-green-500");
      break;
    default:
      break;
  }
}

//Change the visibility of the loading modal based on the isLoading flag
function loadingModal() {
  const loadingModal = document.getElementById("loading-modal"); // Get the loading modal element
  if (isLoading) {
    loadingModal.style.display = "flex";
    modalContent.style.display = "none";
  } else {
    loadingModal.style.display = "none";
  }
}

async function deleteTask(id) {
  // Ask for user confirmation before deleting the task
  if (confirm("Are you sure you want to delete this task?")) {
    try {
      const res = await fetch(
        `https://676d4ea00e299dd2ddff1999.mockapi.io/Tasks/${id}`,
        {
          method: "DELETE",
        }
      );
      // For checking if the deletion is successful or not
      if (res.status === 200) {
        const totalTasks = toDo.length - 1; // Decrement the total task count
        const totalPages = Math.ceil(totalTasks / tasksPerPage); // Recalculate total pages

        // Adjust the current page
        if (currentPage > totalPages) {
          currentPage = totalPages;
        } else if (totalPages === 0) {
          currentPage = 1; // Reset to page 1 if no tasks remain
        }

        showToast("Task deleted successfully!", "delete");
        getTasks();
        filterDetails.classList.add("hidden"); //Hide filter details
        filterType.value = "Select Filter"; // Reset filter
      }
    } catch (error) {
      console.log("error");
    }
  }
}

async function getOneTask(id) {
  const res = await fetch(
    `https://676d4ea00e299dd2ddff1999.mockapi.io/Tasks/${id}`
  );
  const data = res.json();
  return data; // Return the data of task that will be edited
}

function editTask(id) {
  getOneTask(id).then((res) => {
    //Set the form fields with the editedTask's details
    document.getElementById("taskName").value = res.taskName;
    document.getElementById("taskPriority").value = res.taskPriority;
    document.getElementById("taskStatus").value = res.taskStatus;
    document.getElementById("taskDeadLine").value = res.taskDeadLine;
    document.getElementById("taskDetails").value = res.taskDetails;

    updatePriorityAndStatusColors(res.taskPriority, res.taskStatus);

    openModal(modalBox, modalContent);

    isEditing = true; // Set the editing mode
    editingId = id; //Store the task ID
    saveTaskBtn.innerHTML = "Edit"; // Update the save button text to indicate editing mode
  });
}

function showDetail(id) {
  // Find the task by its ID
  const task = toDo.find((todo) => todo.id === id);

  // Generate the priority display element
  const priorityShow =
    task.taskPriority === "Choose"
      ? "-"
      : `<span class="${getPriorityColor(task.taskPriority)}">${
          task.taskPriority
        }</span>`;
  // Generate the status display element
  const statusShow =
    task.taskStatus === "Choose"
      ? "-"
      : `<span class="${getStatusColor(task.taskStatus)}">${
          task.taskStatus
        }</span>`;
  // Generate the deadLine display element
  const deadLineShow = task.taskDeadLine ? task.taskDeadLine : "-";
  // Generate the detail display element
  const taskDetails = task.taskDetails ? task.taskDetails : "-";

  detailModal.innerHTML = `
      <div class="flex flex-col gap-4 p-4">
          <div class="relative flex justify-between">
              <button id="closeShowModal" class="absolute top-1 right-0 bg-red-500 px-2 py-1 text-xs text-white rounded">X</button>
              <h2 class="text-lg font-bold">Task Details</h2>
          </div>
           <table class="border bg-gray-100">
              <tr class="border border-2">
                <td class="p-2 border">Task Name:</td>
                <td class="p-2 font-bold">${task.taskName}</td>
              </tr>
              <tr class="border border-2">
                <td class="p-2 border">Priority:</td>
                <td class="p-2">${priorityShow}</td>
              </tr>
              <tr class="border border-2">
                <td class="p-2 border">Status:</td>
                <td class="p-2">${statusShow}</td>
              </tr>
              <tr class="border border-2">
                <td class="p-2 border">Deadline:</td>
                <td class="p-2 text-gray-700">${deadLineShow}</td>
              </tr>
              <tr class="border border-2">
                <td class="p-2 border">Task Details:</td>
                <td class="p-2 max-w-xs overflow-x-auto whitespace-nowrap">${taskDetails}</td>
              </tr>
            </table>
      </div>
    `;

  document.getElementById("closeShowModal").addEventListener("click", () => {
    closeModal(overlay, detailModal);
  });

  openModal(overlay, detailModal);
}

// Add an event listener to the search button to find tasks by searchTasks function
document.getElementById("searchBtn").addEventListener("click", searchTasks);

function searchTasks() {
  const searchInput = document.getElementById("searchInput");

  const searchTerm = searchInput.value.trim().toLowerCase(); // Get the search term

  if (searchTerm === "") {
    foundedTasks = [...toDo]; //Reset the founded tasks to all tasks
  } else {
    // Filter tasks based on the search term
    foundedTasks = toDo.filter((task) =>
      task.taskName.toLowerCase().includes(searchTerm)
    );
  }
  currentPage = 1; // Reset to the first page

  renderTasks(foundedTasks);
  renderPagination(foundedTasks);
}

// Add an event listener to the filter button to change the filter section visibility
filterBtn.addEventListener("click", () => {
  if (filterType.classList.contains("hidden")) {
    filterType.classList.remove("hidden");
  } else {
    filterType.classList.add("hidden");
  }
});

// Add an event listener to the filter section to select filter option
filterType.addEventListener("change", (e) => {
  const filterValue = e.target.value;
  applyFilter(filterValue);
});

//Shows the filter options and applies the selected filter
function applyFilter(filterValue) {
  filterType.classList.add("hidden");

  if (filterValue === "status") {
    showStatusOptions();
  } else if (filterValue === "priority") {
    showPriorityOptions();
  } else if (filterValue === "deadline") {
    showDeadlineOptions();
  }
}

//Displays the options to filter tasks by status
function showStatusOptions() {
  filterDetails.innerHTML = `
    <select id="statusSelect" class="bg-[#6a52a1] text-xs rounded-lg outline-0">
      <option value="" disabled selected>Choose</option>
      <option value="toDo">ToDo</option>
      <option value="doing">Doing</option>
      <option value="done">Done</option>
    </select>
    <button id="closeFilterBtn"><img src="./assets/images/no-filter.svg" alt="no-filter" class="h-6"></button>
  `;
  filterDetails.classList.remove("hidden");

  const statusSelect = document.getElementById("statusSelect");
  statusSelect.addEventListener("change", (e) => {
    const selectedStatus = e.target.value.toLowerCase();
    filterByStatus(selectedStatus);

    // Add a close button to reset the filter
    document.getElementById("closeFilterBtn").addEventListener("click", () => {
      filterDetails.classList.add("hidden");
      filterType.value = "Select Filter";

      foundedTasks = [...toDo]; // Copy the original task list into foundedTasks to remain original toDo tasks
      currentPage = 1; //Reset to the first Page

      renderTasks(foundedTasks);
      renderPagination(foundedTasks);
    });
  });
}

//Displays the options to filter tasks by priority
function showPriorityOptions() {
  filterDetails.innerHTML = `
      <select id="prioritySelect" class="bg-[#6a52a1] text-xs rounded-lg outline-0">
        <option value="" disabled selected>Choose</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button id="closeFilterBtn"><img src="./assets/images/no-filter.svg" alt="no-filter" class="h-6"></button>
    `;
  filterDetails.classList.remove("hidden");

  const prioritySelect = document.getElementById("prioritySelect");
  prioritySelect.addEventListener("change", (e) => {
    const selectedPriority = e.target.value.toLowerCase();
    filterByPriority(selectedPriority);

    // Add a close button to reset the filter
    document.getElementById("closeFilterBtn").addEventListener("click", () => {
      filterDetails.classList.add("hidden");
      filterType.value = "Select Filter";

      foundedTasks = [...toDo]; // Copy the original task list into foundedTasks to remain original toDo tasks
      currentPage = 1; //Reset to the first Page
      renderTasks(foundedTasks);
      renderPagination(foundedTasks);
    });
  });
}

//Displays the options to filter tasks by deadLine
function showDeadlineOptions() {
  filterDetails.innerHTML = `
      <input type="date" id="deadlineInput" class="bg-[#6a52a1] text-xs p-1 rounded-lg outline-0"/>
      <button id="closeFilterBtn"><img src="./assets/images/no-filter.svg" alt="no-filter" class="h-6"></button>
    `;
  filterDetails.classList.remove("hidden");

  const deadlineInput = document.getElementById("deadlineInput");

  deadlineInput.addEventListener("change", (e) => {
    let selectedDate = e.target.value;
    filterByDeadline(selectedDate);

    // Add a close button to reset the filter
    document.getElementById("closeFilterBtn").addEventListener("click", () => {
      filterDetails.classList.add("hidden");
      filterType.value = "Select Filter";

      foundedTasks = [...toDo]; // Copy the original task list into foundedTasks to remain original toDo tasks
      currentPage = 1; //Reset to the first Page
      renderTasks(toDo);
      renderPagination(toDo);
    });
  });
}

//Filter tasks based on their status and updates the display
function filterByStatus(selectedStatus) {
  const filteredTasks = toDo.filter((task) => {
    const taskStatus = task.taskStatus.toLowerCase();
    return taskStatus === selectedStatus;
  });
  displayTasks(filteredTasks);
}

//Filter tasks based on their priority and updates the display
function filterByPriority(selectedPriority) {
  const filteredTasks = toDo.filter((task) => {
    const taskPriority = task.taskPriority.toLowerCase();
    return taskPriority === selectedPriority;
  });
  displayTasks(filteredTasks);
}

//Filter tasks based on their deadLine and updates the display
function filterByDeadline(selectedDate) {
  const filteredTasks = toDo.filter((task) => {
    const taskDeadLine = task.taskDeadLine;
    return taskDeadLine <= selectedDate;
  });
  displayTasks(filteredTasks);
}

//Update the task list and pagination based on the filtered tasks
function displayTasks(filteredTasks) {
  foundedTasks = filteredTasks;
  currentPage = 1;
  renderTasks(filteredTasks);
  renderPagination(filteredTasks);
}

//Returns the appropriate text color for task priority
function getPriorityColor(priority) {
  switch (priority) {
    case "Low":
      return "text-green-500";
    case "Medium":
      return "text-yellow-500";
    case "High":
      return "text-red-500";
    default:
      return "";
  }
}

//Returns the appropriate text color for task status
function getStatusColor(status) {
  switch (status) {
    case "ToDo":
      return "text-red-500";
    case "Doing":
      return "text-yellow-500";
    case "Done":
      return "text-green-500";
    default:
      return "";
  }
}

//Clear all input fields in the modal and reset Save or Edit button
function clearModalInputs() {
  document.getElementById("taskName").value = "";
  document.getElementById("taskPriority").value = "Choose";
  document.getElementById("taskStatus").value = "Choose";
  document.getElementById("taskDeadLine").value = "";
  document.getElementById("taskDetails").value = "";

  saveTaskBtn.innerHTML = "Save";

  // Remove all priority-specific color classes from the priority section
  prioritySelect.classList.remove(
    "text-green-500",
    "text-yellow-500",
    "text-red-500"
  );

  // Remove all status-specific color classes from the status section
  statusSelect.classList.remove(
    "text-green-500",
    "text-yellow-500",
    "text-red-500"
  );
}

function openModal(modal, content) {
  modal.classList.remove("hidden");

  content.classList.remove("scale-100");
  content.classList.add("scale-0");

  // Create a smooth scaling effect
  setTimeout(() => {
    content.classList.remove("scale-0");
    content.classList.add("scale-100");
  }, 100);
}

function closeModal(modal, content) {
  content.classList.add("scale-50");

  // Create a smooth scaling effect
  setTimeout(() => {
    modal.classList.add("hidden");
    content.classList.remove("scale-50");
  }, 1000);

  // Remove the border from the taskName input if it is not empty
  document.getElementById("taskName").classList.remove("border-red-500");
}

function showToast(message, type) {
  const toast = document.getElementById("toast");

  let bgColor; // Determine the background color of the toast based on the type
  switch (type) {
    case "success":
      bgColor = "bg-green-500";
      break;
    case "delete":
      bgColor = "bg-red-500";
      break;
    case "info":
      bgColor = "bg-blue-800";
      break;
    default:
      bgColor = "bg-gray-800";
  }
  toast.textContent = message; // Set the toast message
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-sm text-white ${bgColor} transition transform scale-105 duration-300`; // Set the toast style
  toast.classList.remove("hidden"); // Make the toast visible

  // Automatically hide the toast after 3 seconds
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// Call the function to get tasks on page loading
getTasks();
