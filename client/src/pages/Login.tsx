import {useState, type FormEvent, type ChangeEvent } from 'react'; 
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../utils/mutations';

import Auth from '../utils/auth';

const Login= () => {
    const [formState, setFormState] = useState({ email: '', username: '', password: '' });
    const [login, { error, data }] = useMutation(LOGIN_USER);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;

        setFormState({
            ...formState,
            [name]: value
        });
    };

    const handleFormSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {
            const { data } = await login({
                variables: { ...formState },
            });
            Auth.login(data.login.token);
        } catch (e) {
            console.error(e);
        }
        setFormState({
            email: '',
            username: '',
            password: '',
        });
    };

    return (
    <main className="login-page">
        <div className="container">
          <div className="card">
            <h4 className="cardheader">Login</h4>
            <div className="card-body">
              {data ? (
                <p>
                  Login successful! You can now close this window.
                </p>
              ) : (
                <form onSubmit={handleFormSubmit}>
                  <input
                    className="form-input"
                    placeholder="Your email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                  />
                  <input
                    className="form-input"
                    placeholder="Your username"
                    name="username"
                    type="username"
                    value={formState.username}
                    onChange={handleChange}
                  />
                  <input
                    className="form-input"
                    placeholder="******"
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                  />
                  <button
                    className="btn btn-block"
                    type="submit"
                  >
                    Submit
                  </button>
                </form>
              )}
  
              {error && (
                <div className="error-message">
                  {error.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  };
        

export default Login;