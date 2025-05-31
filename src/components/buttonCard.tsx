import React from 'react';

type props = {
  className?: string;
  text?: string;
  onClick?: any;
};
const ButtonCard = ({ className, text, onClick }: props) => {
  return (
    <div
      onClick={onClick}
      className={` group overflow-hidden  bg-neutral-50 rounded-xl bg-gradient-to-tr from-sky-800 via-cyan-700 to-cyan-500 text-white ${className}`}
    >
      <div className="before:duration-700 before:absolute before:w-28 before:h-28 before:bg-transparent before:blur-none before:border-8 before:opacity-50 before:rounded-full before:-left-4 before:-top-12 w-64 h-48  flex flex-col justify-between relative z-10 group-hover:before:top-28 group-hover:before:left-44 group-hover:before:scale-125 group-hover:before:blur">
        <div className="text p-3 flex flex-col justify-center gap-2 items-center h-full w-full">
          <span className="font-bold text-2xl text-white">{text}</span>
          <p className="subtitle">Click to show {text}</p>
        </div>
      </div>
    </div>
  );
};

export default ButtonCard;
