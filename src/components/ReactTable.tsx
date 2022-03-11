import * as React from "react";
import { Form } from "react-bootstrap";
import BTable from "react-bootstrap/Table";
import { LinkContainer } from "react-router-bootstrap";
import { Column, Row, useTable, useSortBy, useFilters, useGlobalFilter, useAsyncDebounce } from "react-table";
import { AnyFunction } from "sequelize/types/utils";
import { DbRecord } from "../model/DbRecord";

export interface ReactTableProps<T extends DbRecord> {
    data: Array<T>;
    columns: Array<Column<T>>;
    navigationPath: string;
}

export const ReactTable: React.FC<ReactTableProps<any>> = (props) => {
    const [data, setData] = React.useState(props.data);
    const [searchText, setSearchText] = React.useState("");

    React.useEffect(() => {
        setData((props.data ?? []).filter(d => !searchText || props.columns.some(c => d && d[c.accessor as string]?.toLocaleLowerCase()?.includes(searchText.toLocaleLowerCase()))));
    }, [searchText, props.data]);

    const { getTableProps, headerGroups, rows, prepareRow } = useTable({
        columns: props.columns,
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
        <div>
            <Form style={{ margin: "10px" }}>
                <Form.Control type="text" placeholder="Search..." value={searchText} onChange={(e: any) => setSearchText(e.target.value)} />
            </Form>
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
                        <LinkContainer key={ `${ row.original.id }_link` } to={ `/${props.navigationPath}/${ row.original.id }` }>
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
        </div>
    );
};