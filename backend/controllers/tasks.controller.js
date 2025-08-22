// A temporary in-memory "database" for tasks
let fakeTasks = [];
let currentTaskId = 1;

/**
 * Handles task creation.
 * Associates the new task with a user.
 */
export const createTask = (req, res) => {
  // In a real app, userId would come from the decoded JWT token, not the request body.
  const { title, detail, date, status, userId } = req.body;

  if (!title || !date || !status || !userId) {
    return res.status(400).json({ message: "Title, date, status, and userId are required." });
  }

  const newTask = {
    id: currentTaskId++,
    title,
    detail,
    date,
    status,
    userId,
    createdAt: new Date().toISOString(),
  };

  fakeTasks.push(newTask);
  console.log("Current Tasks:", fakeTasks);

  res.status(201).json({ taskId: newTask.id });
};

/**
 * Handles fetching all tasks for a specific user.
 */
export const getTasks = (req, res) => {
  // In a real app, userId would come from the decoded JWT. We'll use a query param for now.
  // Example request: GET /api/tasks?userId=1
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "A userId query parameter is required." });
  }

  // Find all tasks that belong to the user
  const userTasks = fakeTasks.filter(task => task.userId === parseInt(userId));

  res.status(200).json(userTasks);
};