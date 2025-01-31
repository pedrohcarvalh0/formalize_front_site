document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const registerButton = document.getElementById("register-btn");
    const otpForm = document.getElementById("otp-form");
    const otpButton = document.getElementById("otp-btn");
    const resendOtpLink = document.getElementById("resend-otp-link");

    const loadingPopup = document.getElementById("loading-popup");

    // REGISTRO DE USUÁRIO
    if (registerButton) {
        registerButton.addEventListener("click", async function (event) {
            event.preventDefault();

            const firstName = document.getElementById("firstname").value;
            const lastName = document.getElementById("lastname").value;
            const email = document.getElementById("email").value;
            const cpf = document.getElementById("cpf").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("Confirmpassword").value;

            if (password !== confirmPassword) {
                alert("As senhas não conferem!");
                return;
            }

            const requestData = {
                email: email,
                cpf: cpf,
                first_name: firstName,
                last_name: lastName,
                password: password,
                password2: confirmPassword
            };

            // Exibe o popup de carregamento antes da requisição
            loadingPopup.style.visibility = "visible";
            loadingPopup.style.display = "flex";

            try {
                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/register/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData)
                });

                const responseData = await response.json();

                // Esconde o popup de carregamento após a resposta
                loadingPopup.style.visibility = "hidden";
                loadingPopup.style.display = "none";

                if (response.status === 201) {
                    alert("Usuário cadastrado! Um código de confirmação foi enviado para seu email.");
                    window.location.href = "email_verification.html";
                } else {
                    alert("Erro no cadastro: " + JSON.stringify(responseData));
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro ao conectar-se ao servidor.");
                // Esconde o popup em caso de erro
                loadingPopup.style.visibility = "hidden";
                loadingPopup.style.display = "none";
            }
        });
    }

    // VERIFICAÇÃO DO CÓDIGO OTP
    if (otpButton) {
        otpButton.addEventListener("click", async function (event) {
            event.preventDefault();

            const otpCode = document.getElementById("otp-code").value;
            const email = document.getElementById("email").value;

            if (!email) {
                alert("Por favor, insira seu e-mail.");
                return;
            }

            const otpData = { email: email, otp: otpCode };

            try {
                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/verify/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(otpData)
                });

                const responseData = await response.json();

                if (response.status === 200) {
                    alert("Conta verificada com sucesso! Redirecionando para o login.");
                    window.location.href = "login.html";
                } else {
                    alert("Erro na verificação do OTP: " + (responseData.error || "Código inválido."));
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro ao conectar-se ao servidor.");
            }
        });
    }

    // REENVIO DO CÓDIGO OTP
    if (resendOtpLink) {
        resendOtpLink.addEventListener("click", async function (event) {
            event.preventDefault(); // Evita que o link recarregue a página
            
            const email = document.getElementById("email").value;

            if (!email) {
                alert("Por favor, insira seu e-mail primeiro.");
                return;
            }

            const resendData = { email: email };

            try {
                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/otp-resend/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(resendData)
                });

                const responseData = await response.json();

                if (response.status === 200) {
                    alert("Novo código OTP enviado para o seu email.");
                } else {
                    alert("Erro ao reenviar OTP: " + (responseData.error || "Erro desconhecido."));
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro ao conectar-se ao servidor.");
            }
        });
    }
});
