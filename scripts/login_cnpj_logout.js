// Define a função toggleSidebar de forma global
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // ------------- Lógica de Login -------------
    const continueButton = document.getElementById("continue-button");

    if (continueButton) {
        continueButton.addEventListener("click", async function (event) {
            event.preventDefault();

            // Recupera os valores dos inputs de email e senha
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const emailError = document.getElementById("email-error");
            const passwordError = document.getElementById("password-error");

            // Limpa mensagens de erro anteriores
            emailError.style.display = 'none';
            passwordError.style.display = 'none';

            // Validação dos campos
            if (!email && !password) {
                emailError.style.display = 'block';
                passwordError.style.display = 'block';
                return;
            } else if (!email) {
                emailError.style.display = 'block';
                return;
            } else if (!password) {
                passwordError.style.display = 'block';
                return;
            }

            // Cria o objeto com os dados de login
            const loginData = {
                email: email,
                password: password
            };

            try {
                // Envia a requisição POST para o endpoint de login da API do Django
                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/login/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(loginData)
                });

                // Converte a resposta em JSON
                const responseData = await response.json();

                // Se a resposta for bem-sucedida (por exemplo, status 200)
                if (response.ok) {
                    // Armazena os tokens e o nome completo no localStorage para manter a sessão do usuário
                    localStorage.setItem("access_token", responseData.access_token);
                    localStorage.setItem("refresh_token", responseData.refresh_token);
                    localStorage.setItem("full_name", responseData.full_name);

                    // Redireciona o usuário para a página após login (no seu caso, cnpj_manager.html)
                    window.location.href = "cnpj_manager.html";
                } else {
                    // Exibe a mensagem de erro retornada pela API
                    alert("Erro no login: " + (responseData.detail || "Credenciais inválidas."));
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro ao conectar-se ao servidor.");
            }
        });
    }

    // ------------- Lógica de Logout -------------
    const logoutButton = document.getElementById("logout-button");

    if (logoutButton) {
        logoutButton.addEventListener("click", async function (event) {
            event.preventDefault();

            // Recupera os tokens armazenados no localStorage
            const refresh_token = localStorage.getItem("refresh_token");
            const access_token = localStorage.getItem("access_token");
            if (!refresh_token || !access_token) {
                // Se não houver tokens, redireciona para a página de login
                window.location.href = "login.html";
                return;
            }

            // Cria o objeto com o refresh token para enviar à API
            const logoutData = { refresh_token: refresh_token };

            try {
                // Envia a requisição POST para o endpoint de logout da API do Django,
                // incluindo o token de acesso no cabeçalho de autorização.
                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/logout/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + access_token
                    },
                    body: JSON.stringify(logoutData)
                });

                // Se o logout for bem-sucedido
                if (response.ok) {
                    // Limpa os tokens e dados do usuário armazenados
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    localStorage.removeItem("full_name");

                    // Redireciona para a página de login
                    window.location.href = "login.html";
                } else {
                    const responseData = await response.json();
                    alert("Erro ao fazer logout: " + (responseData.detail || "Token inválido."));
                }
            } catch (error) {
                console.error("Erro na requisição de logout:", error);
                alert("Erro ao conectar-se ao servidor para logout.");
            }
        });
    }
});
