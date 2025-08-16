import './StatCard.css';

/**
 * StatCard Component for displaying statistics on dashboards
 * 
 * @param {Object} props
 * @param {string} props.label - The label for the statistic (e.g., "Total Employees")
 * @param {string|number} props.value - The value to display
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.type - Type of stat (employees, hods, pending, approved, rejected)
 * @param {Function} props.onClick - Optional click handler for the card
 * @param {boolean} props.loading - Whether to show loading state
 * @param {number} props.percentChange - Optional percentage change to display
 */
const StatCard = ({ 
  label, 
  value, 
  icon, 
  type = 'default', 
  onClick, 
  loading = false,
  percentChange 
}) => {
  // Determine the icon container class based on type
  const getIconClass = () => {
    switch (type) {
      case 'employees':
        return 'employees-icon';
      case 'hods':
        return 'hods-icon';
      case 'pending':
        return 'pending-icon';
      case 'approved':
        return 'approved-icon';
      case 'rejected':
        return 'rejected-icon';
      default:
        return 'employees-icon';
    }
  };

  // Get the appropriate color for percentage change
  const getPercentColor = () => {
    if (!percentChange) return null;
    return percentChange >= 0 ? 'var(--mic-logo-green)' : 'var(--mic-bright-red)';
  };

  return (
    <div 
      className={`dashboard-stat-card ${onClick ? 'clickable' : ''}`} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`stat-icon-container ${getIconClass()}`}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="flex justify-between items-baseline">
          {loading ? (
            <div className="stat-value skeleton" style={{ width: '80px', height: '32px' }}></div>
          ) : (
            <div className="stat-value">{value}</div>
          )}
          
          {percentChange !== undefined && !loading && (
            <div 
              className="text-xs font-medium px-2 py-0.5 rounded-full ml-2" 
              style={{ 
                color: getPercentColor(),
                backgroundColor: percentChange >= 0 ? 'rgba(0, 128, 0, 0.1)' : 'rgba(211, 47, 47, 0.1)'
              }}
            >
              {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange)}%
            </div>
          )}
        </div>
      </div>
      
      {onClick && (
        <div className="absolute bottom-2 right-2 opacity-30 hidden sm:block">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default StatCard;
