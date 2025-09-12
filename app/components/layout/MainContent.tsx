const MainContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <main
      className={`
        relative flex-1 overflow-hidden bg-black
        transition-[filter,opacity,transform]
        duration-300 ease-in-out
        will-change-[filter,opacity,transform]
        backface-visibility-hidden
        transform-gpu
      `}
    >
      {children}
    </main>
  );
};

export default MainContent;
