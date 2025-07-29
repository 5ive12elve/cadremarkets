import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 max-w-full">
      <table className="min-w-full divide-y divide-[#db2b2e]">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-[#db2b2e] uppercase tracking-wider bg-black whitespace-nowrap"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#db2b2e]/30">
          {data.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              className={`${
                onRowClick ? 'cursor-pointer hover:bg-[#db2b2e]/10' : ''
              }`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#db2b2e] text-sm sm:text-base">No data available</p>
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      key: PropTypes.string,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func
};

export default Table; 