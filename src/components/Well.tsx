import * as React from "react";
import { Card } from "react-bootstrap";

export interface WellProps {
    style?: React.CSSProperties;
}

export const Well: React.FC<WellProps> = (props) =>
    <Card style={{...{ margin: "10px", background: "#f5f5f5" }, ...(props.style ?? {})}}>
        <Card.Body>
            { props.children }
        </Card.Body>
    </Card>;