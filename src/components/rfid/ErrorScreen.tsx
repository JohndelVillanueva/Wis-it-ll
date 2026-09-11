interface Props {
    message: string;
  }
  
  const ErrorScreen = ({ message }: Props) => {
    return (
      <div className="text-center select-none">
        <div className="w-40 h-40 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600
                        flex items-center justify-center shadow-2xl shadow-red-500/40">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Unable to Process</h1>
        <p className="text-xl text-red-300">{message}</p>
        <p className="text-md text-slate-500 mt-6">Please try again</p>
      </div>
    );
  };
  
  export default ErrorScreen;