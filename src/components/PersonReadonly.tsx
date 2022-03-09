import * as React from "react";
import { ButtonToolbar, ButtonGroup, Button, Form } from "react-bootstrap";
import { DbPerson } from "../model/DbPerson";
import FieldGroup from "./FieldGroup";

export interface PersonEditProps {
    person: DbPerson;
}

export const PersonReadonly: React.FC<PersonEditProps> = (props) => {
    return (
        <Form>
            <FieldGroup
                id="firstNameText"
                control={ { type: "text", value: props.person?.first_name ?? "", placeholder: "Enter first name", onChange: () => {} } }
                label="First Name"
            />
            <FieldGroup
                id="lastNameText"
                control={ { type: "text", value: props.person?.last_name ?? "", placeholder: "Enter last name", onChange: () => {} } }
                label="Last Name"
            />
            <FieldGroup
                id="cityText"
                control={ { type: "text", value: props.person?.city ?? "", placeholder: "Enter city", onChange: () => {} } }
                label="City"
            />
            <FieldGroup
                id="descriptionText"
                control={ { type: "text", as: "textarea", value: props.person?.description ?? "", placeholder: "Enter description", onChange: () => {} } }
                label="Description"
            />
        </Form>
    );
}