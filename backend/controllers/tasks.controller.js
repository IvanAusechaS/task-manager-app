// Import required middleware and validation library
import { requireAuth, validateRequest } from '../utils/decorators.js';
import * as yup from 'yup';

// Temporary storage for tasks (will be replaced with database)
let tasks = [];
let currentTaskId = 1;

// Define validation schema for task creation
// Ensures all required fields are present and valid
const createTaskSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup.string(),
  dueDate: yup.date(),
  priority: yup.string().oneOf(['low', 'medium', 'high']),
  status: yup.string().oneOf(['pending', 'in_progress', 'completed']).default('pending')
});

// Define validation schema for task updates
// All fields are optional since it's a partial update
const updateTaskSchema = yup.object().shape({
  title: yup.string(),
  description: yup.string(),
  dueDate: yup.date(),
  priority: yup.string().oneOf(['low', 'medium', 'high']),
  status: yup.string().oneOf(['pending', 'in_progress', 'completed'])
});

/**
 * Task Controller Class
 * Handles all task-related operations
 */
class TaskController {
  /**
   * Creates a new task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Created task or error message
   */
  async createTask(req, res) {
    try {
      // Validate request body against schema
      await createTaskSchema.validate(req.body);
      const userId = req.user.userId;
      const taskData = req.body;

      // Create new task object with metadata
      const newTask = {
        id: currentTaskId++,
        userId,
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      tasks.push(newTask);
      return res.status(201).json(newTask);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * Retrieves all tasks for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Array} List of user's tasks
   */
  async getTasks(req, res) {
    const userId = req.user.userId;
    const userTasks = tasks.filter(task => task.userId === userId);
    return res.status(200).json(userTasks);
  }

  /**
   * Retrieves a specific task by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Task details or error message
   */
  async getTaskById(req, res) {
    const userId = req.user.userId;
    const taskId = parseInt(req.params.id);
    
    // Find task that belongs to the authenticated user
    const task = tasks.find(t => t.id === taskId && t.userId === userId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    return res.status(200).json(task);
  }

  /**
   * Updates an existing task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Updated task or error message
   */
  async updateTask(req, res) {
    try {
      // Validate update data
      await updateTaskSchema.validate(req.body);
      const userId = req.user.userId;
      const taskId = parseInt(req.params.id);
      const updateData = req.body;

      // Find task index in array
      const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === userId);
      
      if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Update task with new data while preserving other fields
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json(tasks[taskIndex]);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * Deletes a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Success status or error message
   */
  async deleteTask(req, res) {
    const userId = req.user.userId;
    const taskId = parseInt(req.params.id);

    // Find task index in array
    const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === userId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove task from array
    tasks.splice(taskIndex, 1);
    return res.status(204).send();
  }
}

// Create single instance of controller
const controller = new TaskController();

// Export controller methods wrapped with authentication and validation middleware
export default {
  createTask: [
    requireAuth, // Ensures user is authenticated
    validateRequest(createTaskSchema), // Validates request body
    (req, res) => controller.createTask(req, res)
  ],
  getTasks: [
    requireAuth,
    (req, res) => controller.getTasks(req, res)
  ],
  getTaskById: [
    requireAuth,
    (req, res) => controller.getTaskById(req, res)
  ],
  updateTask: [
    requireAuth,
    validateRequest(updateTaskSchema),
    (req, res) => controller.updateTask(req, res)
  ],
  deleteTask: [
    requireAuth,
    (req, res) => controller.deleteTask(req, res)
  ]
};