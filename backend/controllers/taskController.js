const Task = require('../models/taskModel');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });

    return res.status(200).json({
      status: 'success',
      result: tasks.length,
      data: {
        tasks
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Unable to receive tasks...'
    });
  };
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task is not found...'
      });
    };

    return res.status(200).json({
      status: 'success',
      message: `Task-Id: ${task._id}`,
      data: {
        task
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid task id...'
    });
  };
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, reminderAt } = req.body;

    const newTask = await Task.create({
      title,
      description,
      dueDate,
      reminderAt,
      user: req.user._id
    });

    return res.status(201).json({
      status: 'success',
      message: 'New task is created...',
      data: {
        task: newTask
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  };
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task is not found...'
      });
    };

    return res.status(200).json({
      status: 'success',
      message: 'Task is deleted...'
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid task id...'
    });
  };
};

exports.updateTask = async (req, res) => {
  try {
    if (req.body.reminderAt !== undefined) {
      req.body.reminderSent = false;
    }

    const updatedTask = await Task.findOneAndUpdate({
      _id: req.params.id,
      user: req.user._id
    }, req.body, {
      runValidators: true,
      returnDocument: 'after'
    });

    if (!updatedTask) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task is not found...'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Task is updated...',
      data: {
        task: updatedTask
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};