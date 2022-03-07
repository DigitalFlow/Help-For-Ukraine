import * as React from "react";
import { FormGroup, Form, FormControlProps } from "react-bootstrap";

interface FieldGroupProps {
  id: string;
  label: string;
  help?: string;
  control: FormControlProps;
}

const FieldGroup = ( props: FieldGroupProps ) => (
    <Form.Group controlId={ props.id }>
      <Form.Label>{ props.label }</Form.Label>
      <Form.Control { ...props.control } />
      { props.help && <Form.Text>{ props.help }</Form.Text> }
    </Form.Group>
);

export default FieldGroup;
