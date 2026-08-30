import api from '../../utils/axios';
import { useState } from 'react';
import { formatDateTime, formatDateTimeLocal } from '../../utils/date';
import { Loading } from '../../components/Loading';
import './TasksContainer.css';

export function TasksContainer({ tasks, setTasks, searchInput, setError, isTaskTitleValid }) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editReminderAt, setEditReminderAt] = useState('');

  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [togglingTaskId, setTogglingTaskId] = useState(null);

  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    return task.title.toLowerCase().includes(searchInput.trim().toLowerCase());
  });

  function isUserConfirm() {
    return window.confirm('Are you sure you want to proceed this action?');
  };

  function startEditing(task) {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate ? formatDateTimeLocal(task.dueDate) : '');
    setEditReminderAt(task.reminderAt ? formatDateTimeLocal(task.reminderAt) : '');
    setError('');
  };

  function cancelEditing() {
    setEditingTaskId(null);
    setError('');
    setEditTitle('');
    setEditDescription('');
    setEditDueDate('');
    setEditReminderAt('');
  };

  async function deleteTask(taskId) {
    if (!isUserConfirm()) return;

    try {
      setIsDeletingTask(true);
      setDeletingTaskId(taskId);

      await api.delete(`/api/v1/tasks/${taskId}`);
      setTasks((curTasks) => {
        return curTasks.filter((curTask) => {
          return curTask._id !== taskId;
        });
      });
      setError('');
    } catch (error) {
      setError(error?.response?.data?.message || 'Unable to delete.');
    } finally {
      setDeletingTaskId(null);
      setIsDeletingTask(false);
    };
  };

  async function updateTask(taskId) {
    if (!isTaskTitleValid(editTitle)) return;

    try {
      setUpdatingTaskId(taskId);

      const reminderDate = editReminderAt ? new Date(editReminderAt).toISOString() : null;
      const dueDateValue = editDueDate ? new Date(editDueDate).toISOString() : null;

      const response = await api.put(`/api/v1/tasks/${taskId}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: dueDateValue,
        reminderAt: reminderDate
      });

      const updatedTask = response.data.data.task;

      setTasks((curTasks) => {
        return curTasks.map((curTask) => {
          return curTask._id === taskId ? updatedTask : curTask;
        });
      });

      cancelEditing();
    } catch (error) {
      setError(error?.response?.data?.message || 'Unable to update.');
    } finally {
      setUpdatingTaskId(null);
    };
  };

  async function toggleCompleted(task) {
    try {
      setTogglingTaskId(task._id);

      const response = await api.put(`/api/v1/tasks/${task._id}`, { completed: !task.completed });
      const updatedTask = response.data.data.task;

      setTasks((curTasks) => {
        return curTasks.map((curTask) => {
          return curTask._id === task._id ? updatedTask : curTask;
        });
      });
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to update the status');
    } finally {
      setTogglingTaskId(null);
    };
  };

  return (
    <div>
      {tasks.length === 0 ? (
        <div className="loading-box">
          <p className="not-found-text">No tasks found</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="loading-box">
          <p className="not-found-text">No matching tasks found</p>
        </div>
      ) : isDeletingTask ? (
        <Loading />
      ) : (
        <div className="tasks-container">
          {
            filteredTasks.map((task) => {
              const editingTask = task._id === editingTaskId;
              const isTaskBusy = updatingTaskId === task._id || deletingTaskId === task._id || togglingTaskId === task._id;

              return (
                <div key={task._id}>
                  {
                    editingTask ? (
                      <div className="tasks-grid" onKeyDown={(e) => { e.key === 'Enter' && updateTask(task._id) }}>
                        <div className="input-form">
                          <label>Title</label>
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        </div>
                        <div className="input-form">
                          <label>Description</label>
                          <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                        </div>
                        <div className="input-form">
                          <label>Due date</label>
                          <input type="datetime-local" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                        </div>
                        <div className="input-form">
                          <label>Reminder at</label>
                          <input type="datetime-local" value={editReminderAt} onChange={(e) => setEditReminderAt(e.target.value)} />
                        </div>
                        <button className="btn update-btn" onClick={() => updateTask(task._id)} disabled={isTaskBusy}>
                          {updatingTaskId === task._id ? 'Updating...' : 'Update'}
                        </button>
                        <button className="btn cancel-btn" onClick={cancelEditing} disabled={isTaskBusy}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="tasks-grid">
                        <div className="title-wrap">
                          <div className="task-title" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
                        </div>
                        <div className="description-wrap">
                          <p>Description</p>
                          <div className="task-description">{task.description || 'None'}</div>
                        </div>
                        <div className="date-wrap duedate-wrap">
                          <p>Due date</p>
                          <div className="task-duedate">{task.dueDate ? formatDateTime(task.dueDate) : 'No due date'}</div>
                        </div>
                        <div className="date-wrap">
                          <p>Reminder at</p>
                          <div className="task-reminderat">{task.reminderAt ? formatDateTime(task.reminderAt) : 'No reminder'}</div>
                        </div>
                        <button className={task.completed ? 'btn completed-btn' : 'btn mark-complete-btn'} onClick={() => toggleCompleted(task)} disabled={isTaskBusy}>
                          {togglingTaskId === task._id ? 'Updating...' : task.completed ? '🎉 Completed' : 'Mark as completed'}
                        </button>
                        <button className="btn edit-btn" onClick={() => startEditing(task)} disabled={isTaskBusy}>
                          Edit
                        </button>
                        <button className="btn delete-btn" onClick={() => deleteTask(task._id)} disabled={isTaskBusy}>
                          {deletingTaskId === task._id ? 'Deleting' : 'Delete'}
                        </button>
                      </div>
                    )
                  }
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
};