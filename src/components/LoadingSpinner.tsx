// components/LoadingSpinner.tsx
const LoadingSpinner = ({ size = '8', color = 'border-blue-500' }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 ${color}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;