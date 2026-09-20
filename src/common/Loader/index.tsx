const Loader = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 bg-whiten">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-lg shadow-primary/30">
        AW
      </span>
      <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-solid border-primary border-t-transparent"></div>
    </div>
  );
};

export default Loader;
