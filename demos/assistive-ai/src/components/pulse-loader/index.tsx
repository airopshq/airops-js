import './index.scss';

const PulseLoader = ({ label }: { label: string }) => (
  <div className="loader-container">
    <span>{label}</span>
    <div className="pulse-dot pulse-dot1"></div>
    <div className="pulse-dot pulse-dot2"></div>
    <div className="pulse-dot pulse-dot1"></div>
  </div>
);

export default PulseLoader;
