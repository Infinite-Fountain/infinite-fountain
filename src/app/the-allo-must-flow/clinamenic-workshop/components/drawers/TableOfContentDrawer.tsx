import React from 'react';

// Define the props interface
interface TableOfContentDrawerProps {
  drawerState: 'closed' | 'table-of-contents-open';
  handleCloseTableOfContentsDrawer: () => void;
}

const TableOfContentDrawer: React.FC<TableOfContentDrawerProps> = ({
  drawerState,
  handleCloseTableOfContentsDrawer,
}) => {
  return (
    <div
      className={`fixed inset-0 z-60 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
        drawerState === 'table-of-contents-open' ? 'translate-y-0' : 'translate-y-[100vh]'
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
          drawerState === 'table-of-contents-open' ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={drawerState === 'table-of-contents-open' ? handleCloseTableOfContentsDrawer : undefined}
      ></div>

      {/* Drawer Content */}
      <div
        className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing drawer
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-white text-xl focus:outline-none focus:ring-2 focus:ring-white rounded"
          onClick={handleCloseTableOfContentsDrawer}
          aria-label="Close Table of Contents Drawer"
        >
          &times;
        </button>

        {/* Drawer Container */}
        <div className="drawer-container w-full h-full relative">
          {/* Table of Contents Content */}
          <div className="p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
            {/* Add your table of contents items here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableOfContentDrawer;
