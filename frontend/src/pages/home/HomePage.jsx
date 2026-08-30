import api from '../../utils/axios';
import { useEffect } from 'react';
import { Header } from '../../components/Header';
import { FeaturesBar } from '../../components/FeaturesBar';
import { TasksContainer } from './TasksContainer';
import { Loading } from '../../components/Loading';
import './HomePage.css';

export function HomePage({ tasks, setTasks, setError, isLoadingTasks, setIsLoadingTasks, isTaskTitleValid, notiPermission, setNotiPermission, notiEnable, setNotiEnable, searchInput, setSearchInput }) {

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/api/v1/tasks');
        setTasks(response.data.data.tasks);
        setError('');
      } catch (error) {
        setError(error?.response?.data?.message || 'Unable to load data.');
      } finally {
        setIsLoadingTasks(false);
      };
    };
    fetchHomeData();
  }, [setError, setIsLoadingTasks, setTasks]);

  return (
    <div className="home-page">
      <title>Task Manager</title>

      <Header />
      {
        isLoadingTasks ? (
          <Loading />
        ) : (
          <>
            <FeaturesBar tasks={tasks} searchInput={searchInput} setSearchInput={setSearchInput} setError={setError} notiPermission={notiPermission} setNotiPermission={setNotiPermission} notiEnable={notiEnable} setNotiEnable={setNotiEnable} setIsLoadingTasks={setIsLoadingTasks} />
            <TasksContainer tasks={tasks} setTasks={setTasks} searchInput={searchInput} setError={setError} isTaskTitleValid={isTaskTitleValid} />
          </>
        )
      }
    </div >
  );
};