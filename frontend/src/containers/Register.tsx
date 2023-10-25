import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useAuthContext } from "../contextProviders/AuthenticationContextProvider";
import { AxiosError } from "axios";


export const RegisterPage: React.FC = () => {
    const authContext = useAuthContext();

    const [alertMessage, setAlertMessage] = useState({
        message: "",
        variant: ""
    })

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        if (password === confirmPassword) {
            try {
                await authContext?.register(username, password, confirmPassword);
                setAlertMessage({ message: "Account created", variant: "success" });

            } catch (error) {
                if (error instanceof AxiosError) {
                    setAlertMessage({ message: error.response?.data, variant: "danger" });
                } else {
                    console.error(error);
                    setAlertMessage({ message: "Account registration failed", variant: "danger" });
                }
            }
        } else {
            setAlertMessage({ message: "Passwords don't match", variant: "danger" });
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="mx-auto text-center my-5 col-6">
            <Form.Group className="my-3">
                <Form.Label>Username:</Form.Label>
                <Form.Control
                    type="text"
                    name="username"
                    required
                    />
            </Form.Group>
            <Form.Group className="my-3">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    required
                    />
            </Form.Group>
            <Form.Group className="my-3">
                <Form.Label>Retype Password:</Form.Label>
                <Form.Control
                    type="password"
                    name="confirmPassword"
                    required
                    />
            </Form.Group>
            {alertMessage.message && (
                <Alert variant={alertMessage.variant}>{alertMessage.message}</Alert>
            )}
            <Button type="submit">Register</Button>
        </Form>
    );
};
