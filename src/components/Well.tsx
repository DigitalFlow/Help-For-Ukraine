import * as React from "react";
import { Card } from "react-bootstrap";

export const Well: React.FC = (props: React.Props<any>) =>
    <Card style={{ margin: "10px" }}>
        <Card.Body>
            { props.children }
        </Card.Body>
    </Card>;