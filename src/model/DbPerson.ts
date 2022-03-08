export interface DbPerson {
    id: string;
    first_name: string;
    last_name: string;
    city: string;
    description: string;
    question: string;
    user_id: string;
    created_on: string;

    // These are not saved in the actual database person table, only for sending data
    contact_information: string;
    secret_answer: string;
}