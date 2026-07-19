import React from 'react';

const Background: React.FC = () => {
  return (
    <>
      {/* Template: fixed grid lines only */}
      <div className="fixed grid-lines w-full h-[100vh] top-0 right-0 left-0 pointer-events-none z-0"></div>
    </>
  );
};

export default Background;