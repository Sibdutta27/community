import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Panel from "@components/Panel/Panel";
import { customStyles } from "./styles";
import './index.css';

/**
 * Loading table components
 * @returns 
 */
const LoadingTable = () => {
  // Array to represent 10 rows
  const rows = Array.from({ length: 10 }, (_, index) => index);
  return (
    <>
      <table className="loading-table">
        <tbody>
          {/* Loop to render 10 table rows */}
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {/* Loop to render 6 cells in each row */}
              {Array.from({ length: 5 }, (_, cellIndex) => (
                <td key={cellIndex} className="loading-table-cell">
                  <div className="loading-table-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

/**
 * Table cell components
 * @param {*} props 
 * @returns 
 */
export const TableCell = ({ title, children }) => {
  return (
    <>
      <div title={title} className="table-cell">
        {children}
      </div>
    </>
  );
};


/**
 * Custom table component
 * @param {*} props 
 * @returns 
 */
const Table = (props) => {
  const {
    data              ,  // dataset for render table
    columns           ,  // table column
    loading           ,  // loading state
    selectable        ,  // option for select row column
    handleSelect      ,  // callback function handle row select
    handleChange      ,  // callback function for handle change
    defaultRowsParPage,  // default rows per page by user. if not set default is 10
    defaultCurrentPage,  // default current page by user. if not set default is 1
    totalRows         ,  // default total rows for the dataset. user should always provide this.
    perPageOption     ,  // per page option array. user should always provide.
    realtimeFilter    ,  // filter filds for realtime filter.
    typeCounts,
    bulkActionComponent,
    selectableRowsComponent
  } = props;

  const [paginationTotalRows, setPaginationTotalRows] = useState(totalRows); // total no of row in dataset.
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsParPage || 10); // rows par page. default is 10.
  const [currentPage, setCurrentPage] = useState(defaultCurrentPage || 1); // current page state variable.

  // Realtime filter state variable
  const [filterData, setFilterData] = useState({});

  // Update total rows when prop changes
  useEffect(() => {
    setPaginationTotalRows(totalRows);
  }, [totalRows]);


  // Take action in filter data change
  useEffect(() => {
    // For first time rendering filter data is empty. Do nothing in this case.
    if (Object.keys(filterData).length === 0) {
      return;
    }

    // Call handle change function
    handleChange?.(rowsPerPage, 1, filterData);

    // Set current page to first page.
    setCurrentPage(1);

  }, [filterData, handleChange, rowsPerPage]);

  // Handle mouse enter function.
  const handleMouseEnter = () => {
    props.handleMouseEnter?.();
  };

  // Handle mouse leave function.
  const handleMouseLeave = () => {
    props.handleMouseLeave?.();
  };

  /**
   * Handle current page change
   * @param {*} newCurrentPage 
   */
  const handlePageChange = (newCurrentPage) => {

    // Call the function for handle pagination.
    handleChange?.(rowsPerPage, newCurrentPage, filterData);

    // Set state variable
    setCurrentPage(newCurrentPage);
  };

  /**
   * Handle row per page change
   * @param {*} newRowsPerPage 
   */
  const handleRowsPerPageChange = (newRowsPerPage) => {

    if ( newRowsPerPage == rowsPerPage ) return;

    // Call the function for handle pagination.
    handleChange?.(newRowsPerPage, currentPage, filterData);

    // Set state variable.
    setCurrentPage(1);
    setRowsPerPage(newRowsPerPage);
  };

  /**
   * Function handle selected row change.
   */
  const handleOnSelectedRowsChange = ({
    selectedRows,
    selectedCount,
    allSelected,
  }) => {
    handleSelect?.(selectedRows, selectedCount, allSelected);
  };

  /**
   * Function that handle filter change.
   * @param {*} key 
   * @param {*} value 
   */
  const handleFilterChange = (key, value) => {
    // Set filter data
    setFilterData((prevData) => {
      return {
        ...prevData,
        [key]: value,
      };
    });
  };

  // Contain which type count is currently active.
  const typeCountActive = filterData.typeCount || '';

  return (
    <Panel padding="compact">
    <div
      className={`table-container ${loading ? "table-loading" : ""} ${selectable ? "table-selectable" : ""}`}
    >
      {
        typeCounts && typeCounts.length > 0 && (
          <div className="table-type-counts">
            {typeCounts &&
              typeCounts.map((countInfo) => (
                <div
                  key={countInfo.key}
                  onClick={() => {
                    setFilterData({ typeCount: countInfo.key });
                  }}
                  className={
                    countInfo.key == typeCountActive
                      ? "table-type-count-active"
                      : "table-type-count-inactive"
                  }
                >
                  {`${countInfo.name} (${countInfo.count})`}
                </div>
              ))}
          </div>
        )
      }

      <div className="table-filters">
        <div className="table-filters-inner">
          {/* Render realtime filter */}
          {realtimeFilter &&
            realtimeFilter.map((filter) => {
              return filter.render(
                handleFilterChange,
                filterData[filter.name]
              );
            })}
        </div>
        {bulkActionComponent && bulkActionComponent()}
      </div>
      {loading ? (
        <LoadingTable />
      ) : (
        <DataTable
          pagination
          paginationServer
          selectableRows={selectable}
          columns={columns}
          data={data || []}
          // Pagination details.
          paginationTotalRows={paginationTotalRows}
          paginationDefaultPage={currentPage}
          paginationPerPage={rowsPerPage}
          paginationRowsPerPageOptions={perPageOption}
          // Mouse enter leave callback.
          onRowMouseEnter={handleMouseEnter}
          onRowMouseLeave={handleMouseLeave}
          // Pagination callback.
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          // Row select callback.
          onSelectedRowsChange={handleOnSelectedRowsChange}
          selectableRowsComponent={selectableRowsComponent}
          className="table-data"
          customStyles={customStyles}
        />
      )}
    </div>
    </Panel>
  );
};

export default Table;