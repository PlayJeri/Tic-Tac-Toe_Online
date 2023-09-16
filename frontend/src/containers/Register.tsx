import React, { useState } from "react";


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
        })
    }

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
            })
            
            if (response.status === 201) {
                console.log("Account created successfully");
                setErrorMsg("");
                setPasswordsMatch(true);
            }

            else {
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
                <p style={{ color: "red" }}>{errorMsg}</p>
            )}
            <button type="submit">Register</button>
        </form>
        </>
    )
}