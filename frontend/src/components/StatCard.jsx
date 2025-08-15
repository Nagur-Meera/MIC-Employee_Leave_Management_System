import './StatCard.css';

/**
 * StatCard Component for displaying statistics on dashboards
 * 
 * @param {Object} props
 * @param {string} props.label - The label for the statistic (e.g., "Total Employees")
 * @param {string|number} props.value - The value to display
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.type - Type of stat (employees, hods, pending, approved, rejected)
 */
const StatCard = ({ label, value, icon, type = 'default' }) => {
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

  return (
    <div className="dashboard-stat-card">
      <div className={`stat-icon-container ${getIconClass()}`}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
