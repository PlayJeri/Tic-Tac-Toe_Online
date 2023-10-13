import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

export const RegisterPage: React.FC = () => {
    const [alertMessage, setAlertMessage] = useState({
        message: "",
        variant: ""
    })
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: ""
    });

    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (formData.password === formData.confirmPassword) {
            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    password2: formData.confirmPassword
                })
            });

            if (response.status === 201) {
                console.log("Account created successfully");
                console.log(response);
                setAlertMessage({ message: "Account created successfully!", variant: "success" });
                setPasswordsMatch(true);
            } else {
                const errorData = await response.json();
                console.log(errorData.error);
                setAlertMessage({ message: errorData.error, variant: "danger" });
                setPasswordsMatch(false);
            }
        } else {
            setAlertMessage({ message: "Passwords didn't match", variant: "danger" });
            setPasswordsMatch(false);
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="mx-auto text-center my-5 col-6">
            <Form.Group className="my-3">
                <Form.Label>Username:</Form.Label>
                <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    />
            </Form.Group>
            <Form.Group className="my-3">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    />
            </Form.Group>
            <Form.Group className="my-3">
                <Form.Label>Retype Password:</Form.Label>
                <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
