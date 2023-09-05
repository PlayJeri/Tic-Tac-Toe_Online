import React, { useState } from "react";


export const RegisterPage: React.FC = () => {

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
        })
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (formData.password === formData.confirmPassword) {
            console.log('Registration data:', formData);
        } else {
            setPasswordsMatch(false);
        }
    }

    return (
        <>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="confirmPassword">Retype Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </div>
            {!passwordsMatch && (
                <p style={{ color: "red" }}>Passwords do not match.</p>
            )}
            <button type="submit">Register</button>
        </form>
        </>
    )
}