import React from 'react';

interface DonationChartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationChartDrawer: React.FC<DonationChartDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-y-0' : 'translate-y-[100vh]'
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Drawer Content */}
      <div
        className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing drawer
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-white text-xl focus:outline-none focus:ring-2 focus:ring-white rounded"
          onClick={onClose}
          aria-label="Close Donation Chart Drawer"
        >
          &times;
        </button>

        {/* Drawer Container */}
        <div className="drawer-container w-full h-full relative flex flex-col items-center justify-center">
          {/* White Card */}
          <div className="bg-white w-10/12 h-3/4 rounded-lg shadow-md mx-auto mt-4 flex flex-col items-center justify-start">
            {/* Header Text */}
            <div className="text-black text-center text-lg leading-tight mt-4">
              <p>Your 3pts vote has been registered onchain.</p>
              <p>You can also add a "tip" to the project</p>
              <p>to increase its matching funds even further.</p>
            </div>
          </div>

          {/* Green Button */}
          <button className="bg-green-500 text-white font-bold py-2 px-4 rounded mt-4 mb-8">
            Donate xxx
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationChartDrawer;
