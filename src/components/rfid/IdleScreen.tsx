const IdleScreen = () => {
    return (
      <div className="text-center select-none">
        <div className="relative mx-auto mb-10 w-48 h-48">
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <div
            className="absolute inset-4 rounded-full bg-blue-500/30 animate-ping"
            style={{ animationDelay: '0.3s' }}
          />
          <div
            className="absolute inset-8 rounded-full bg-blue-500/40 animate-ping"
            style={{ animationDelay: '0.6s' }}
          />
          {/* Center icon */}
          <div className="absolute inset-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                          flex items-center justify-center shadow-2xl shadow-blue-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M4.222 8.879a15 15 0 0122.547 0" />
            </svg>
          </div>
        </div>
  
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Tap your card
        </h1>
        <p className="text-xl text-slate-400">
          Please tap your RFID card on the scanner
        </p>
      </div>
    );
  };
  
  export default IdleScreen;