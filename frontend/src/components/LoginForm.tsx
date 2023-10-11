import { Form, Button } from "react-bootstrap";
import { useState } from "react";


interface LoginFormProps {
    handleFormSubmit: (formData: any) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ handleFormSubmit }) => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({...formData, [name]: value });
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        handleFormSubmit(formData);
    }

    return (
        <>
        <div className="text-center my-4">
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label className="my-2">Username</Form.Label>
                    <Form.Control
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label className="my-2">Password</Form.Label>
                    <Form.Control
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
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