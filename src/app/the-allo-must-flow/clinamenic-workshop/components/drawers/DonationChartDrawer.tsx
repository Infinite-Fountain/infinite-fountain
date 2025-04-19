import React, { useState } from 'react';
import config from '../../configs/temporary_donation_chart.json';

interface DonationChartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationChartDrawer: React.FC<DonationChartDrawerProps> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState('$15');

  const activeColor = config.amount_button_colors.active;
  const unactiveColor = config.amount_button_colors.unactive;

  const handleButtonClick = (amount: string) => {
    setSelectedAmount(amount);
  };

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

            {/* Donation Amount Buttons */}
            <div className="flex justify-center space-x-2 mt-4">
              <button style={{ backgroundColor: selectedAmount === '$5' ? activeColor : unactiveColor }} className="text-black font-bold py-1 px-3 rounded" onClick={() => handleButtonClick('$5')}>$5</button>
              <button style={{ backgroundColor: selectedAmount === '$10' ? activeColor : unactiveColor }} className="text-black font-bold py-1 px-3 rounded" onClick={() => handleButtonClick('$10')}>$10</button>
              <button style={{ backgroundColor: selectedAmount === '$15' ? activeColor : unactiveColor }} className="text-black font-bold py-1 px-3 rounded" onClick={() => handleButtonClick('$15')}>$15</button>
              <button style={{ backgroundColor: selectedAmount === '$25' ? activeColor : unactiveColor }} className="text-black font-bold py-1 px-3 rounded" onClick={() => handleButtonClick('$25')}>$25</button>
              <button style={{ backgroundColor: selectedAmount === '$50' ? activeColor : unactiveColor }} className="text-black font-bold py-1 px-3 rounded" onClick={() => handleButtonClick('$50')}>$50</button>
            </div>
          </div>

          {/* Green Button */}
          <button className="bg-green-500 text-white font-bold py-2 px-4 rounded mt-4 mb-8">
            Donate {selectedAmount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationChartDrawer;
