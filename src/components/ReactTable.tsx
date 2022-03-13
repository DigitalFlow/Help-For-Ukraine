import * as React from "react";
import { Form, Button, Col, FloatingLabel } from "react-bootstrap";
import BTable from "react-bootstrap/Table";
import BRow from "react-bootstrap/Row";
import { LinkContainer } from "react-router-bootstrap";
import { Column, Row, useTable, usePagination, useSortBy } from "react-table";
import { AnyFunction } from "sequelize/types/utils";
import { DbRecord } from "../model/DbRecord";
import FieldGroup from "./FieldGroup";

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

    const {
        getTableProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize }
    }: any = useTable({
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
    } as any, useSortBy, usePagination);

    // Render the UI for your table
    return (
        <div>
            <Form style={{ margin: "10px" }}>
                <Form.Control type="text" placeholder="Search..." value={searchText} onChange={(e: any) => setSearchText(e.target.value)} />
            </Form>
            <BTable striped bordered hover size="sm" {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup: any) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column: any) => (
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
                {page.map((row: Row<DbRecord>) => {
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
            <BRow>
                <Col>
                    <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {"<<"}
                    </Button>{" "}
                    <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {"<"}
                    </Button>{" "}
                    <Button onClick={() => nextPage()} disabled={!canNextPage}>
                    {">"}
                    </Button>{" "}
                    <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {">>"}
                    </Button>{" "}
                    <span style={{ margin: "5px" }}>
                        Page{" "}
                        <strong>
                            {pageIndex + 1} of {pageOptions.length}
                        </strong>{" "}
                    </span>
                </Col>
                <Col>
                    <Form.Select
                        id="goToPage"
                        aria-label="Go to page"
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) : 0;
                            gotoPage(page);
                        }}
                        value={pageIndex}
                    >
                        {
                            Array.from({ length: pageOptions.length })
                            .map((_, i) => (
                                <option key={i} value={i}>
                                    Go to page {i + 1}
                                </option>
                            ))
                        }
                    </Form.Select>
                </Col>
                <Col>
                    <Form.Select
                        id="pageSize"
                        aria-label="Page size"
                        onChange={e => {
                            setPageSize(Number(e.target.value));
                        }}
                        value={pageSize}
                    >
                        {
                            [10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize} entries per page
                                </option>
                            ))
                        }
                    </Form.Select>
                </Col>
            </BRow>
        </div>
    );
};