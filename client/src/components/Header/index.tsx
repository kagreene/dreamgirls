import { useState } from "react";

const Header = () => {
  const [displayLoginForm, setDisplayLoginForm] = useState(false);

  const LoginHandler = () => {
    setDisplayLoginForm(!displayLoginForm);
  };
  return (
    <header className="add-css-styling">
      <div className="add-css-styling">
        <h1> Safe Spotter</h1>
        <p>Welcome to Safe Spotter!</p>
        <button onClick={LoginHandler}>
          {displayLoginForm ? "Exit Login" : "Login"}
        </button>
        {displayLoginForm && (
          <form onSubmit={LoginHandler}>
            <label>
              Username:
              <input type="text" name="username" required />
            </label>
            <label>
              Email:
              <input type="email" name="email" required />
            </label>
            <button type="submit">Submit</button>
          </form>
        )}
        ;
      </div>
    </header>
  );
};

export default Header;