import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';
import OAuth from '../components/OAuth';

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        navigate('/');
      }
    } catch (error) {
      toast.error('Bad user credentials');
    }
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back</p>
        </header>
        <main>
          <form onSubmit={onSubmit}>
            <input
              type="email"
              placeholder="Email"
              id="email"
              value={email}
              className="emailInput"
              onChange={onChange}
            />

            <div className="passwordInputDiv">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                id="password"
                value={password}
                className="passwordInput"
                onChange={onChange}
              />

              <img
                src={visibilityIcon}
                alt="visibility icon"
                className="showPassword"
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            </div>

            <Link to="/forgot-password" className="forgotPasswordLink">
              Forgot Password
            </Link>

            <div className="signInBar">
              <p className="signInText">Sign In</p>
              <button className="signInButton">
                <ArrowRightIcon
                  fill="#ffffff"
                  width={34}
                  height={34}
                ></ArrowRightIcon>
              </button>
            </div>
          </form>
          <OAuth></OAuth>

          <Link to="/sign-up" className="registerLink">
            Sign Up Instead
          </Link>
        </main>
      </div>
    </>
  );
};

export default SignIn;
