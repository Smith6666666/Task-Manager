import api from '../../utils/axios';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Header } from '../../components/Header';
import { Loading } from '../../components/Loading';
import './CreateTaskPage.css';

export function CreateTaskPage({ setTasks, error, setError, isTaskTitleValid }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderAt, setReminderAt] = useState('');

  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const navigate = useNavigate();

  async function createTask() {
    if (!isTaskTitleValid(title)) return;

    try {
      setIsCreatingTask(true);

      const reminderDate = reminderAt ? new Date(reminderAt).toISOString() : null;
      const dueDateValue = dueDate ? new Date(dueDate).toISOString() : null;

      const response = await api.post('/api/v1/tasks', {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDateValue,
        reminderAt: reminderDate
      });
      const newTask = response.data.data.task;

      setTasks((currentTasks) => [
        ...currentTasks,
        newTask
      ]);
      setTitle('');
      setDescription('');
      setDueDate('');
      setReminderAt('');
      setError('');

      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <div className="create-task-page">
      <title>Create a task</title>
      <Header />
      {isCreatingTask ? <Loading /> : (
        <div className="create-form" onKeyDown={(e) => { e.key === 'Enter' && createTask() }}>
          <div>
            <h2>Create a task</h2>
            <div className="wrap-box">
              <label>Task name</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="wrap-box">
              <label>Description</label>
              <textarea type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="wrap-box">
              <label>Due date</label>
              <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="wrap-box">
              <label>Reminder at</label>
              <input type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} />
            </div>
            <div className={!error.trim() ? '' : 'error-msg'}>{error}</div>
            <div className="btns-box">
              <button className="create-btn" onClick={createTask} >
                Create
              </button>
              <NavLink to="/dashboard">
                <button className="create-cancel-btn">
                  Cancel
                </button>
              </NavLink>
            </div>
          </div>
        </div >
      )}
    </div>
  );
};