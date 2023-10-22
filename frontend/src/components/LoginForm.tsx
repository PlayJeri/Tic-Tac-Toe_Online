import { Form, Button } from "react-bootstrap";
// import { useState } from "react";


interface LoginFormProps {
    handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ handleFormSubmit }) => {

    return (
        <>
        <div className="text-center my-4">
            <Form onSubmit={handleFormSubmit}>
                <Form.Group>
                    <Form.Label className="my-2">Username</Form.Label>
                    <Form.Control
                    type="text"
                    id="username"
                    name="username"
                    required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className="my-2">Password</Form.Label>
                    <Form.Control
                    type="password"
                    id="password"
                    name="password"
                    required
                    />
                </Form.Group>
                <Button className="my-4" variant="primary" type="submit">
                    Login
                </Button>
                </Form>
        </div>
        </>
    )
}