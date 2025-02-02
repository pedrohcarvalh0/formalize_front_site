document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const registerButton = document.getElementById("register-btn");
    const otpForm = document.getElementById("otp-form");
    const otpButton = document.getElementById("otp-btn");
    const resendOtpLink = document.getElementById("resend-otp-link");

    // POP UP da tela de registro
    const loadingPopup = document.getElementById("loading-popup");
    const loadingText = document.getElementById("loading-text");
    const spinner = document.getElementById("spinner");

    // POP UP da tela de confirmação de conta
    const statusPopup = document.getElementById("status-popup");
    const statusText = document.getElementById("status-text");

    // Define os elementos de mensagem de erro
    const firstNameError = document.getElementById("firstname-error");
    const lastNameError = document.getElementById("lastname-error");
    const emailError = document.getElementById("email-error");
    const cpfError = document.getElementById("cpf-error");
    const passwordError = document.getElementById("password-error");
    const confirmPasswordError = document.getElementById("confirmpassword-error");

    // REGISTRO DE USUÁRIO
    if (registerButton) {
        registerButton.addEventListener("click", async function (event) {
            event.preventDefault();

            // Recupera os valores dos inputs (usando trim para evitar espaços em branco)
            const firstName = document.getElementById("firstname").value.trim();
            const lastName = document.getElementById("lastname").value.trim();
            const email = document.getElementById("email").value.trim();
            const cpf = document.getElementById("cpf").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("Confirmpassword").value;

            // Oculta as mensagens de erro anteriores
            firstNameError.style.display = "none";
            lastNameError.style.display = "none";
            emailError.style.display = "none";
            cpfError.style.display = "none";
            passwordError.style.display = "none";
            confirmPasswordError.style.display = "none";

            let hasErrors = false;

            
            // Valida cada campo
            if (!firstName) {
                firstNameError.style.display = "block";
                hasErrors = true;
            }
            if (!lastName) {
                lastNameError.style.display = "block";
                hasErrors = true;
            }
            if (!email) {
                emailError.style.display = "block";
                hasErrors = true;
            }
            if (!cpf) {
                cpfError.style.display = "block";
                hasErrors = true;
            }
            if (!password) {
                passwordError.style.display = "block";
                hasErrors = true;
            }
            if (!confirmPassword) {
                confirmPasswordError.style.display = "block";
                hasErrors = true;
            }
            if (password && confirmPassword && password !== confirmPassword) {
                // Se as senhas foram preenchidas, mas não conferem
                confirmPasswordError.textContent = "As senhas não conferem!";
                confirmPasswordError.style.display = "block";
                hasErrors = true;
            }

            // Se houver algum erro, interrompe a execução
            if (hasErrors) {
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
            loadingText.textContent = "Registrando usuário...";
            spinner.style.display = "block"; // Mostra o spinner
            loadingPopup.style.visibility = "visible";
            loadingPopup.style.display = "flex";

            try {
                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/register/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData)
                });

                const responseData = await response.json();

                if (response.status === 201) {
                    // Atualiza a mensagem no popup
                    loadingText.textContent = "Usuário cadastrado! Um código de confirmação foi enviado para seu email.";
                    spinner.style.display = "none"; // Esconde o spinner

                    // Aguarda 3 segundos e redireciona
                    setTimeout(() => {
                        window.location.href = "email_verification.html";
                    }, 3000);
                } else {
                    // Exibe erro no popup
                    loadingText.textContent = "Erro no cadastro: " + JSON.stringify(responseData);
                    spinner.style.display = "none"; // Esconde o spinner
                    
                    // Aguarda 3 segundos e fecha o popup
                    setTimeout(() => {
                        loadingPopup.style.visibility = "hidden";
                        loadingPopup.style.display = "none";
                    }, 4000);
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                //alert("Erro ao conectar-se ao servidor.");
                loadingText.textContent = "Erro ao conectar-se ao servidor.";
                spinner.style.display = "none"; // Esconde o spinner

                // Aguarda 3 segundos e fecha o popup
                setTimeout(() => {
                    loadingPopup.style.visibility = "hidden";
                    loadingPopup.style.display = "none";
                }, 4000);
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
                showStatusPopup("Por favor, insira seu e-mail.", true);
                return;
            }

            const otpData = { email: email, otp: otpCode };

            // Exibe popup de status enquanto verifica o código
            showStatusPopup("Verificando código e email...", false);

            try {
                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/verify/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(otpData)
                });

                const responseData = await response.json();

                if (response.status === 200) {
                    showStatusPopup("Conta verificada com sucesso! Redirecionando para o login.", false);
                    
                    // Aguarda 3 segundos e redireciona
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 4000);
                } else {
                    showStatusPopup("Erro na verificação do código: " + (responseData.error || "Código inválido."), true);
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                showStatusPopup("Erro ao conectar-se ao servidor.", true);
            }
        });
    }

    // REENVIO DO CÓDIGO OTP
    if (resendOtpLink) {
        resendOtpLink.addEventListener("click", async function (event) {
            event.preventDefault(); // Evita que o link recarregue a página
            
            const email = document.getElementById("email").value;

            if (!email) {
                //alert("Por favor, insira seu e-mail primeiro.");
                showStatusPopup("Por favor, insira seu e-mail primeiro.", true);
                return;
            }

            const resendData = { email: email };

            // Exibe popup informando que o código está sendo reenviado
            showStatusPopup("Enviando novo código...", false);

            try {
                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/otp-resend/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(resendData)
                });

                const responseData = await response.json();

                if (response.status === 200) {
                    showStatusPopup("Um novo código foi enviado para o seu email, cheque novamente.", false);
                } else {
                    showStatusPopup("Erro ao reenviar Código: " + (responseData.error || "Erro desconhecido."), true);
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                showStatusPopup("Erro ao conectar-se ao servidor.", true);
            }
        });
    }

     // Função para exibir o popup de status
    function showStatusPopup(message, isError) {
        statusText.textContent = message;
        statusText.style.color = isError ? "red" : "green"; // Define a cor do texto conforme o status
        statusPopup.style.visibility = "visible";
        statusPopup.style.display = "flex";

        // Se for erro, fecha automaticamente após 4 segundos
        if (isError) {
            setTimeout(() => {
                statusPopup.style.visibility = "hidden";
                statusPopup.style.display = "none";
            }, 4000);
        }
    }
});