import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

export const RegisterPage: React.FC = () => {
    const [errorMsg, setErrorMsg] = useState("");
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
                setErrorMsg("");
                setPasswordsMatch(true);
            } else {
                const errorData = await response.json();
                console.log(errorData.error);
                setErrorMsg(errorData.error);
                setPasswordsMatch(false);
            }
        } else {
            setErrorMsg("Passwords didn't match!");
            setPasswordsMatch(false);
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Username:</Form.Label>
                <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Password:</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Retype Password:</Form.Label>
                <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            {!passwordsMatch && (
                <Alert variant="danger">{errorMsg}</Alert>
            )}
            <Button type="submit">Register</Button>
        </Form>
    );
};
