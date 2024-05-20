import { getAuth, Auth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
interface LoginProps {
    auth: Auth;
}

const Login: React.FC<LoginProps> = ({ auth }) => {

    function loginSubmitHandler() {

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });


    }

    return (
        <>
            <h1>Login:</h1>

            <form method='POST' onSubmit={loginSubmitHandler}>

                <input type="email" placeholder="email" />
                <br />
                <input type="password" placeholder="password" />
                <br />
                <input type="submit" />

            </form>

            <p>no account? sign up <a href="">here</a></p>
        </>
    )
}

export default Login


