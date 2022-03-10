import * as React from "react";
import { ButtonToolbar, ButtonGroup, Button, Form } from "react-bootstrap";
import { DbPerson } from "../model/DbPerson";
import FieldGroup from "./FieldGroup";

export interface PersonEditProps {
    person: DbPerson;
    isNew: boolean;
    setFirstName: (e: any) => void;
    setLastName: (e: any) => void;
    setCity: (e: any) => void;
    setDescription: (e: any) => void;
    setQuestion: (e: any) => void;
    setContactInformation: (e: any) => void;
    setAnswer: (e: any) => void;
}

export const PersonEdit: React.FC<PersonEditProps> = (props) => {
    return (
        <Form>
            <FieldGroup
                id="firstNameText"
                control={ { type: "text", value: props.person?.first_name ?? "", placeholder: "Enter first name", onChange: props.setFirstName } }
                label="First Name"
                help="Will be shown publicly"
            />
            <FieldGroup
                id="lastNameText"
                control={ { type: "text", value: props.person?.last_name ?? "", placeholder: "Enter last name", onChange: props.setLastName } }
                label="Last Name"
                help="Will be shown publicly"
            />
            <FieldGroup
                id="cityText"
                control={ { type: "text", value: props.person?.city ?? "", placeholder: "Enter city", onChange: props.setCity } }
                label="City"
                help="Not your current city, but your home city. Will be shown publicly."
            />
            <FieldGroup
                id="descriptionText"
                control={ { type: "text", as: "textarea", value: props.person?.description ?? "", placeholder: "Enter description", onChange: props.setDescription } }
                label="Description"
                help="You can tell something about yourself so that your relatives can recognize you. Will be shown publicly, be careful."
            />
            <FieldGroup
                id="questionText"
                control={ { type: "text", as: "textarea", value: props.person?.question ?? "", placeholder: "Enter question", onChange: props.setQuestion } }
                label="Question"
                help="Ask a question that only your family can answer. Do _NOT_ use anything easy to guess such as your eye / hair color or similar."
            />
            {
                props.isNew &&
                <FieldGroup
                    id="answerText"
                    control={ { type: "text", as: "textarea", value: props.person?.secret_answer ?? "", placeholder: "Enter answer to question (secret)", onChange: props.setAnswer } }
                    label="Question Answer"
                    help="Minimum length: 4 characters. Your family will have to give the same answer as you do to see your contact information, so choose something they will get right."
                />
            }
            {
                props.isNew &&
                <FieldGroup
                    id="contactInformationText"
                    control={ { type: "text", as: "textarea", value: props.person?.contact_information ?? "", placeholder: "Leave a message for your relatives, how can you be contacted?", onChange: props.setContactInformation } }
                    label="Message for Family"
                    help="The message for your family can contain information on how to reach you. It is stored encrypted and can only be decrypted with the correct answer. Only you and people knowing the answer can view it."
                />
            }
      </Form>);
};