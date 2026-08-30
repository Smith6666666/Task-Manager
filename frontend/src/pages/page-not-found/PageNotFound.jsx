import { Header } from '../../components/Header';
import { FeaturesBar } from '../../components/FeaturesBar';
import LogoSm from '../../assets/logo-sm.png';
import './PageNotFound.css';

export function PageNotFound({ tasks, searchInput, setSearchInput, setError, notiPermission, setNotiPermission, notiEnable, setNotiEnable, setIsLoadingTasks }) {
  return (
    <div className="not-found-page">
      <title>Page Not Found | 404</title>
      <Header />
      <FeaturesBar tasks={tasks} searchInput={searchInput} setSearchInput={setSearchInput} setError={setError} notiPermission={notiPermission} setNotiPermission={setNotiPermission} notiEnable={notiEnable} setNotiEnable={setNotiEnable} setIsLoadingTasks={setIsLoadingTasks} />
      <div className="not-found-container">
        <img src={LogoSm} />
        <span></span>
        <p>Page Not Found</p>
      </div>
    </div>
  );
};