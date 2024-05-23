function Login() {

    return (
        <>
            <h1>Login:</h1>

            <form method='POST'>

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


