import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Responsive table component that transforms into cards on mobile devices
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects to display in the table
 * @param {Array} props.columns - Array of column configuration objects
 * @param {Function} [props.onRowClick] - Optional callback when a row is clicked
 * @param {String} [props.keyField='id'] - Field to use as unique key for rows
 * @param {String} [props.emptyMessage='No data available'] - Message to display when data is empty
 * @param {Boolean} [props.loading=false] - Whether the table is in loading state
 * @param {Number} [props.loadingRows=5] - Number of skeleton rows to show when loading
 */
const ResponsiveTable = ({ 
  data = [],
  columns = [],
  onRowClick,
  keyField = 'id',
  emptyMessage = 'No data available',
  loading = false,
  loadingRows = 5
}) => {
  // Show loading skeleton if loading is true
  if (loading) {
    return (
      <>
        {/* Desktop loading skeleton */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array(loadingRows).fill(0).map((_, index) => (
                <tr key={`loading-${index}`}>
                  {columns.map((column) => (
                    <td key={`loading-${index}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile loading skeleton */}
        <div className="sm:hidden">
          {Array(loadingRows).fill(0).map((_, index) => (
            <div 
              key={`loading-mobile-${index}`}
              className="bg-white p-4 mb-3 rounded-lg shadow"
            >
              {columns.filter(col => col.showInMobile !== false).map((column, i) => (
                <div key={`loading-mobile-${index}-${column.key}`} className={`flex justify-between ${i !== 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}`}>
                  <span className="text-xs font-medium text-gray-500">{column.header}</span>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  }

  // Show empty state if no data
  if (data.length === 0) {
    return (
      <div className="bg-white p-8 text-center rounded-lg shadow">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto responsive-table">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr 
                key={row[keyField]} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column) => (
                  <td 
                    key={`${row[keyField]}-${column.key}`} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    data-label={column.header}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile card layout */}
      <div className="sm:hidden table-to-cards">
        {data.map((row) => (
          <div 
            key={row[keyField]}
            onClick={() => onRowClick && onRowClick(row)}
            className={`bg-white p-4 mb-3 rounded-lg shadow ${onRowClick ? 'cursor-pointer active:bg-gray-50' : ''}`}
          >
            {columns.filter(col => col.showInMobile !== false).map((column, i) => (
              <div 
                key={`${row[keyField]}-${column.key}-mobile`} 
                className={`flex justify-between items-center ${i !== 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}`}
                data-label={column.header}
              >
                <span className="text-xs font-medium text-gray-500">{column.header}</span>
                <span className="text-sm text-right">
                  {column.render ? column.render(row) : row[column.key]}
                </span>
              </div>
            ))}
            
            {onRowClick && (
              <div className="mt-3 flex justify-end">
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ResponsiveTable;
