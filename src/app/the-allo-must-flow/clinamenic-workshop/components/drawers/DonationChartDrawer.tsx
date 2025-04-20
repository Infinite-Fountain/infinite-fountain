import React, { useState } from 'react';
import config from '../../configs/temporary_donation_chart.json';

interface DonationChartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  openDonationFlowDrawer: () => void;
}

const DonationChartDrawer: React.FC<DonationChartDrawerProps> = ({ isOpen, onClose, openDonationFlowDrawer }) => {
  const [selectedAmount, setSelectedAmount] = useState('$15');

  const activeColor = config.amount_button_colors.active;
  const unactiveColor = config.amount_button_colors.unactive;

  const handleButtonClick = (amount: string) => {
    setSelectedAmount(amount);
  };

  const yAxis = config['y-axis'][0];
  const firstBarChart = config.bar_charts.find((chart: any) => chart.name === 1);
  const firstBarChartPct = firstBarChart ? firstBarChart.pct : '0%';

  const secondBarChart = config.bar_charts.find((chart: any) => chart.name === 2);
  const secondBarChartPct = secondBarChart ? secondBarChart.pct : '0%';

  const thirdBarChart = config.bar_charts.find((chart: any) => chart.name === 3);
  const thirdBarChartPct = thirdBarChart ? thirdBarChart.pct : '0%';

  const donateButtonColor = config.amount_button_colors.active;

  const firstBarChartColor = firstBarChart ? firstBarChart.color : 'grey';
  const secondBarChartColor = secondBarChart ? secondBarChart.color : 'grey';
  const thirdBarChartColor = thirdBarChart ? thirdBarChart.color : donateButtonColor;

  const leaderBenchmark = config.benchmarks.leader;
  const leaderPct = leaderBenchmark ? leaderBenchmark.pct : '0%';
  const leaderUsdc = leaderBenchmark ? leaderBenchmark.usdc : '$0';

  const averageBenchmark = config.benchmarks.average;
  const averagePct = averageBenchmark ? averageBenchmark.pct : '0%';
  const averageUsdc = averageBenchmark ? averageBenchmark.usdc : '$0';

  const firstBarChartLabel = firstBarChart ? firstBarChart.label : '';
  const secondBarChartLabel = secondBarChart ? secondBarChart.label : '';
  const thirdBarChartLabel = thirdBarChart ? thirdBarChart.label : '';

  const thirdLabelColor = config.amount_button_colors.active;

  const activeDonationPair = config.donation_pairs.find((pair: any) => pair.amount === selectedAmount) || config.donation_pairs.find((pair: any) => pair.default);
  const activeThirdBarChartPct = activeDonationPair ? activeDonationPair.pct : '0%';
  const thirdBarChartUsdc = activeDonationPair ? activeDonationPair.usdc : 'na';

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

        {/* Drawer Container */}
        <div className="drawer-container w-full h-full relative flex flex-col items-center justify-center">
          {/* White Card */}
          <div className="bg-white w-10/12 h-full rounded-lg shadow-md mx-auto mt-4 mb-4 flex flex-col items-center justify-start">
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

            {/* Chart Frame */}
            <div className="relative w-5/6 h-3/6 border-4 border-black mt-4 flex items-center justify-center rounded-lg">
              {/* Y-Axis Name */}
              <div
                className="
                  absolute
                  left-9
                  top-0
                  bottom-0
                  flex
                  text-black
                  text-sm
                  h-full
                "
              >
                <span className="transform -rotate-90 origin-center">{yAxis.name}</span>
              </div>

              {/* Y-Axis Values */}
              <div
                className="
                  absolute
                  left-4
                  top-0
                  bottom-0
                  flex
                  flex-col
                  justify-between
                  text-black
                  text-sm
                  h-full
                "
              >
                <span className="text-right">{yAxis['value 100']}</span>
                <span className="text-right">{yAxis['value 75']}</span>
                <span className="text-right">{yAxis['value 50']}</span>
                <span className="text-right">{yAxis['value 25']}</span>
                <span className="text-right">{yAxis['value 0']}</span>
              </div>

              {/* Bar Chart 1 */}
              <div className="absolute bottom-0 left-[5rem] w-[10%]" style={{ height: firstBarChartPct, backgroundColor: firstBarChartColor }}></div>

              {/* Bar Chart 2 */}
              <div className="absolute bottom-0 left-[9rem] w-[10%]" style={{ height: secondBarChartPct, backgroundColor: secondBarChartColor }}></div>

              {/* Bar Chart 3 */}
              <div className="absolute bottom-0 left-[13rem] w-[10%]" style={{ height: activeThirdBarChartPct, backgroundColor: thirdBarChartColor }}></div>

              {/* First Bar Chart Label */}
              <div className="absolute text-black text-sm" style={{ left: '5rem', bottom: '-4rem' }}>
                {firstBarChartLabel.split(' ').map((word, index) => (
                  <div key={index} style={{ lineHeight: '1rem', textAlign: 'center' }}>{word}</div>
                ))}
              </div>

              {/* Second Bar Chart Label */}
              <div className="absolute text-black text-sm" style={{ left: '8.5rem', bottom: '-4rem' }}>
                {secondBarChartLabel.split(' ').map((word, index) => (
                  <div key={index} style={{ lineHeight: '1rem', textAlign: 'center' }}>{word}</div>
                ))}
              </div>

              {/* Third Bar Chart Label */}
              <div className="absolute text-sm" style={{ left: '13rem', bottom: '-4rem', color: thirdLabelColor, fontWeight: 'bold' }}>
                {thirdBarChartLabel.split(' ').map((word, index) => (
                  <div key={index} style={{ lineHeight: '1rem', textAlign: 'center' }}>{word}</div>
                ))}
              </div>

              {/* First Bar Chart Amount */}
              <div className="absolute text-sm" style={{ left: '5rem', bottom: `calc(${firstBarChartPct} + 1%)`, color: unactiveColor, fontWeight: 'bold', backgroundColor: 'white', zIndex: 20 }}>
                {firstBarChart ? firstBarChart.usdc : 'na'}
              </div>

              {/* Second Bar Chart Amount */}
              <div className="absolute text-sm" style={{ left: '8.5rem', bottom: `calc(${secondBarChartPct} + 1%)`, color: unactiveColor, fontWeight: 'bold', backgroundColor: 'white', zIndex: 20 }}>
                {secondBarChart ? secondBarChart.usdc : 'na'}
              </div>

              {/* Third Bar Chart Amount */}
              <div className="absolute text-sm" style={{ left: '13rem', bottom: `calc(${activeThirdBarChartPct} + 1%)`, color: thirdLabelColor, fontWeight: 'bold', backgroundColor: 'white', zIndex: 20 }}>
                {thirdBarChartUsdc}
              </div>

              {/* Leader Box */}
              <div className="absolute right-2 text-black text-sm" style={{ bottom: leaderPct, backgroundColor: 'transparent' }}>
                <div>leader {leaderUsdc}</div>
              </div>

              {/* Leader Line */}
              <div className="absolute z-10" style={{ bottom: leaderPct, left: '5rem', right: '7rem', borderBottom: '5px dotted black' }}></div>

              {/* Average Box */}
              <div className="absolute right-2 text-black text-sm" style={{ bottom: averagePct, backgroundColor: 'transparent' }}>
                <div>average {averageUsdc}</div>
              </div>

              {/* Average Line */}
              <div className="absolute z-10" style={{ bottom: averagePct, left: '5rem', right: '7rem', borderBottom: '5px dotted black' }}></div>

            </div>

            {/* Donate Button */}
            <div className="flex-grow"></div> {/* Spacer to push button to bottom */}
            <button
              style={{ backgroundColor: donateButtonColor, position: 'absolute', right: '4rem', bottom: '2rem' }}
              className="text-black font-bold py-2 px-4 rounded"
              onClick={() => {
                onClose(); // Close DonationChartDrawer
                openDonationFlowDrawer(); // Open DonationFlowDrawer
              }}
            >
              Donate {selectedAmount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationChartDrawer;
