// Arquivo: scripts/password_recovery.js
document.addEventListener("DOMContentLoaded", function () {

    // ========= 1. Solicitação de Redefinição de Senha =========
    const resetForm = document.getElementById("password-reset-form");
    const loaderContainer = document.getElementById("loader-container");
    const loaderMessage = document.getElementById("loader-message");

    if (resetForm) {
        resetForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const email = document.getElementById("email").value.trim();

            if (!email) {
                alert("Por favor, informe um e-mail válido.");
                return;
            }

            try {

                // Mostra o loader
                loaderContainer.style.display = 'flex';
                loaderMessage.textContent = "Enviando e-mail...";

                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/password-reset/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email })
                });

                const responseData = await response.json();

                if (response.status === 200) {
                    // Atualiza o conteúdo do loader-container para mostrar a mensagem de sucesso
                    loaderContainer.innerHTML = `
                        <div class="check-icon">✔️</div>
                        <p>Um e-mail com o link para redefinir sua senha foi enviado. Por favor, verifique sua caixa de entrada.</p>`;
                    resetForm.reset();
        
                    setTimeout(() => {
                        loaderContainer.style.display = 'none';
                    }, 5000);
                } else {
                    alert("Erro ao solicitar redefinição de senha: " + (responseData.error || "Verifique o e-mail informado."));
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro ao conectar-se ao servidor.");
            } finally {
                // Se houver erro, oculta o loader
                if (response && response.status !== 200) {
                    loaderContainer.style.display = 'none';
                }
            }
        });
    }

    // ========= 2. Definição da Nova Senha =========
    const newPasswordForm = document.getElementById("reset-password-form");
    
    if (newPasswordForm) {
        // Função para extrair uidb64 e token do URL
        // Exemplo: se o URL for
        // http://127.0.0.1:8000/api/v1/accounts/password-reset-confirm/MQ/cklt32-cae9216106c475085d4562a498023deb/
        // os dois últimos segmentos serão: uidb64 e token

        // Função para extrair uidb64 e token da query string
        function extractUidAndToken() {
            const params = new URLSearchParams(window.location.search);
            const uidb64 = params.get('uidb64');
            const token = params.get('token');
            return { uidb64, token };
        }

        const { uidb64, token } = extractUidAndToken();

        newPasswordForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (password !== confirmPassword) {
                alert("As senhas não conferem!");
                return;
            }

            const payload = {
                password: password,
                confirm_password: confirmPassword,
                uidb64: uidb64,
                token: token
            };

            try {
                const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/set-new-password/", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const responseData = await response.json();

                if (response.status === 200) {
                    alert("Senha redefinida com sucesso! Você será redirecionado para a página de login.");
                    // Redireciona após 3 segundos
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 3000);
                } else {
                    alert("Erro ao redefinir senha: " + (responseData.error || "Verifique as informações e tente novamente."));
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro ao conectar-se ao servidor.");
            }
        });
    }
});
