import React from 'react';
import { downloadPNG, downloadSVG } from '../utils/exportUtils';
import { Download, Image as ImageIcon } from 'lucide-react';

const ExportToolbar = ({ svgRef }) => {
  const handleExportPNG = () => {
    if (svgRef.current) {
      // get bounds for perfect fit
      const { width, height } = svgRef.current.getBoundingClientRect();
      downloadPNG(svgRef.current, 'timing-diagram.png', width, height);
    }
  };

  const handleExportSVG = () => {
    if (svgRef.current) {
      downloadSVG(svgRef.current, 'timing-diagram.svg');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleExportPNG}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        <ImageIcon className="w-4 h-4" />
        Export PNG
      </button>
      
      <button 
        onClick={handleExportSVG}
        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        <Download className="w-4 h-4" />
        Export SVG
      </button>
    </div>
  );
};

export default ExportToolbar;
