const LoadingScreen = () => {
    return (
      <div className="text-center select-none">
        <div className="w-24 h-24 mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
        </div>
        <h1 className="text-4xl font-bold text-white">Loading…</h1>
        <p className="text-lg text-slate-400 mt-3">Looking up your record</p>
      </div>
    );
  };
  
  export default LoadingScreen;