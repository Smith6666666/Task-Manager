import LoadingGif from '../assets/loading.gif';

export function Loading() {
  return (
    <div className="loading-box">
      <img className="loading-gif" src={LoadingGif} />
    </div>
  );
};