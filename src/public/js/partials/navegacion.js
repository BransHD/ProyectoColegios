$(document).ready(function () {
    CargarLinks();
    setTimeout(function () {
        $(".jm-loadingpage").fadeOut("slow", function () {
            $(".content").fadeIn("slow"); // Muestra el contenido después de desvanecer el div
        });
    }, 500);
});

async function CargarLinks() {
    const contentContainer = $('#contenedorprincipal');

    const loadingHtml = `
    <div class="jm-loadingpage">
        <lottie-player src="/lottiejson/loading.json" class="" background="transparent" speed="1"
        style="width: 250px; height: 250px;" loop autoplay></lottie-player>
    </div>
    `;

    const menuLinks = $("a.menu");

    // Verificamos si el evento ya ha sido asignado
    if (!menuLinks.data('eventAssigned')) {
        // Si no se ha asignado el evento, lo marcamos como asignado
        menuLinks.data('eventAssigned', true);

        menuLinks.on("click", async function (event) {
            event.preventDefault();

            contentContainer.html(loadingHtml);

            const url = $(this).attr('href');

            try {
                const response = await $.ajax({
                    url: url,
                    method: 'GET',
                });

                // Verificar si la sesión ha expirado
                if (response.includes('login-card-description')) {
                    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                    window.location.href = '/iniciarsesion'; // Cambia a la ruta correcta
                } else {
                    // Animar el contenido: opacidad a 0, reemplazar el contenido y luego animar la opacidad de vuelta
                    contentContainer.animate({ opacity: 0 }, 1000, () => {
                        contentContainer.html(response); // Reemplazar el contenido
                        contentContainer.animate({ opacity: 1 }, 500); // Animar la opacidad de vuelta
                    });
                }
            } catch (error) {
                console.error(error);
                // Mostrar un mensaje de error al usuario 
                contentContainer.html(`
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-lg-6">
                                <div class="text-center mt-4">
                                    <img class="mb-4 img-error" src="/img/404logo.jpg" />
                                    <p class="lead">Esta URL solicitada no se encontró en este servidor.</p>
                                    <a href="/">
                                        <i class="fas fa-arrow-left me-1"></i>
                                        Regresar
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            }
        });
    }
}
