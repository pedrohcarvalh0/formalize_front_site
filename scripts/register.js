document.getElementById("register-btn").addEventListener("click", async function (event) {
    event.preventDefault();
    const firstName = document.getElementById("firstname").value;
    const lastName = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;
    const cpf = document.getElementById("cpf").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("Confirmpassword").value;

    const button = document.getElementById("register-btn");
    button.disabled = true; // Desativa o botão para evitar múltiplos envios

    // Validações adicionais
    if (password !== confirmPassword) {
        alert("As senhas não coincidem.");
        button.disabled = false;
        return;
    }

    function validarCPF(cpf) {
        return /^\d{11}$/.test(cpf);
    }

    if (!validarCPF(cpf)) {
        alert("CPF inválido. Digite apenas números, sem pontos ou traços.");
        button.disabled = false;
        return;
    }

    const requestBody = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        cpf: cpf,
        password: password,
        password2: confirmPassword
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            alert("Cadastro realizado com sucesso! Verifique seu e-mail.");
            window.location.href = "email_confirmation.html";
        } else {
            const errorData = await response.json();
            alert(errorData.detail || "Erro ao cadastrar. Verifique os dados.");
        }
    } catch (error) {
        alert("Erro ao se conectar ao servidor.");
    } finally {
        button.disabled = false;
    }
});
