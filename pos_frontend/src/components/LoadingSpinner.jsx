export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
}
