import * as React from "react";
import BTable from "react-bootstrap/Table";
import { LinkContainer } from "react-router-bootstrap";
import { Column, Row, useTable, useSortBy, useFilters, useGlobalFilter, useAsyncDebounce } from "react-table";
import { DbRecord } from "../model/DbRecord";

export interface ReactTableProps<T extends DbRecord> {
    data: Array<T>;
    columns: Array<Column<T>>;
    navigationPath: string;
}

export const ReactTable: React.FC<ReactTableProps<any>> = ({data, columns, navigationPath}) => {
    const { getTableProps, headerGroups, rows, prepareRow } = useTable({
        columns,
        data,
        sortTypes: {
            alphanumeric: (rowA: Row, rowB: Row, columnName: string, desc: boolean) => {
                const valueA = rowA.values[columnName]?.toLowerCase() ?? "";
                const valueB = rowB.values[columnName]?.toLowerCase() ?? "";

                if (desc) {
                    return valueA.localeCompare(valueB) > 0 ? 1 : -1;
                }
                return valueB.localeCompare(valueA) > 0 ? -1 : 1;
            }
        }
    } as any, useSortBy);

    // Render the UI for your table
    return (
        <BTable striped bordered hover size="sm" {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps((column as any).getSortByToggleProps())}>
                                {column.render("Header")}
                                 {/* Add a sort direction indicator */}
                                <span>
                                    {(column as any).isSorted
                                    ? (column as any).isSortedDesc
                                        ? " 🔽"
                                        : " 🔼"
                                    : ""}
                                </span>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
            {rows.map((row: Row<DbRecord>, i) => {
                prepareRow(row);
                return (
                    <LinkContainer key={ `${ row.original.id }_link` } to={ `/${navigationPath}/${ row.original.id }` }>
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return (
                                    <td {...cell.getCellProps()}>
                                    {cell.render("Cell")}
                                    </td>
                                );
                            })}
                        </tr>
                    </LinkContainer>
                );
            })}
            </tbody>
        </BTable>
    );
};