// Inicializar Lucide Icons
lucide.createIcons();

// Observador para animaciones al hacer scroll (Intersection Observer)
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Opcional: dejar de observar si solo queremos la animación 1 vez
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Seleccionar elementos a animar
    const animatedItems = document.querySelectorAll('.ruta-slide');
    animatedItems.forEach(item => {
        observer.observe(item);
    });

    // Efecto de Glassmorphism dinámico en Navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.85)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.75)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Inicializar Mapa Interactitivo (Leaflet)
    if (document.getElementById('interactive-map')) {
        // Centrado en costa vasca
        const map = L.map('interactive-map', { scrollWheelZoom: false }).setView([43.35, -2.6], 10);

        // Tiles modernos y limpios
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Coordenadas de las etapas
        const stages = [
            { name: "Bilbao", coords: [43.263, -2.935], info: "Inicio de la aventura." },
            { name: "Zumaia", coords: [43.299, -2.257], info: "Camping Zumaia.<br><a href='https://www.outdooractive.com/mobile/es/route/ruta-de-senderismo/guipuzcoa/euskadi-idea-etapa-0/338616413/?share=%7E34lw3ute%244osswvs3' target='_blank'>Ver ruta a Itxaspe</a>" },
            { name: "Itxaspe", coords: [43.287, -2.327], info: "Camping Itxaspe.<br><a href='https://www.outdooractive.com/mobile/es/route/ruta-de-senderismo/guipuzcoa/euskadi-idea-etapa-1/338610832/?share=%7E34lvp7ix%244osswvzh' target='_blank'>Ver ruta a Lekeitio</a>" },
            { name: "Lekeitio", coords: [43.362, -2.502], info: "Camping Leagi.<br><a href='https://www.outdooractive.com/mobile/es/route/ruta-de-senderismo/vizcaya/euskadi-idea-etapa-2b/338610934/?share=%7E34lvppex%244osswvzh' target='_blank'>Ver ruta a Laida/Portuondo</a>" },
            { name: "Laida", coords: [43.398, -2.658], info: "Cruce en barco." },
            { name: "Portuondo", coords: [43.397, -2.695], info: "Camping Portuondo.<br><a href='https://www.outdooractive.com/es/route/ruta-de-senderismo/vizcaya/euskadi-ruta-5/339050674/?share=%7E34pyirpa%244osszxvb' target='_blank'>Veure ruta a Mungia</a>" },
            { name: "Mungia", coords: [43.353, -2.841], info: "Final de caminada. Agafarem el bus cap a Gorliz." },
            { name: "Gorliz", coords: [43.415, -2.935], info: "Camping Gorliz. Destí final de l'etapa (amb bus)." },
            { name: "Bilbao (Vuelta)", coords: [43.263, -2.935], info: "Fi de l'aventura." }
        ];

        // Añadir marcadores
        stages.forEach((stage, index) => {
            const nodeIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #1a5c40; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            L.marker(stage.coords, { icon: nodeIcon }).addTo(map)
                .bindPopup(`<h4>${index + 1}. ${stage.name}</h4><p>${stage.info}</p>`);
        });

        // ==========================================
        // LÓGICA PARA DIBUJAR RUTAS EXACTAS (GPX)
        // ==========================================
        /* 
           Para que Leaflet dibuje la ruta *exacta*, necesitamos los ficheros .gpx. 
           Por defecto intentará cargarlos. Si descargas los archivos de Outdooractive 
           y los guardas en la misma carpeta como 'etapa1.gpx', 'etapa2.gpx'... 
           ¡aparecerán solitos!
        */
        const gpxFiles = [
            'etapa0.gpx', // Zumaia -> Itxaspe
            'etapa1.gpx', // Itxaspe -> Lekeitio
            'etapa2.gpx', // Lekeitio -> Laida
            'etapa3.gpx', // Excursión Gaztelugatxe
            'etapa4.gpx'  // Portuondo -> Gorliz
        ];

        // Recolectar todos los límites (bounds)
        let globalBounds = L.latLngBounds();
        let loadedCount = 0;

        gpxFiles.forEach((file) => {
            new L.GPX(file, {
                async: true,
                marker_options: {
                    startIconUrl: '',
                    endIconUrl: '',
                    shadowUrl: ''
                },
                polyline_options: {
                    color: '#2b8c63',
                    opacity: 0.9,
                    weight: 5,
                    lineCap: 'round'
                }
            }).on('loaded', function (e) {
                // Expandir límites globales con esta ruta
                globalBounds.extend(e.target.getBounds());
                loadedCount++;

                // Si hemos cargado todas las que existen, aplicamos zoom global
                if (loadedCount > 0) {
                    map.fitBounds(globalBounds, { padding: [150, 150] });
                }
            }).addTo(map);
        });


    }

    // Lógica para el Slider de Rutes
    const slider = document.querySelector('.rutas-slider');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (slider && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            const cardWidth = slider.querySelector('.ruta-card').offsetWidth + 48; // card + gap
            slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            const cardWidth = slider.querySelector('.ruta-card').offsetWidth + 48; // card + gap
            slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });

        // Opcional: Ocultar flechas si no hay más scroll
        slider.addEventListener('scroll', () => {
            const scrollLeft = slider.scrollLeft;
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            prevBtn.style.opacity = scrollLeft <= 10 ? '0' : '1';
            prevBtn.style.pointerEvents = scrollLeft <= 10 ? 'none' : 'auto';

            nextBtn.style.opacity = scrollLeft >= maxScroll - 10 ? '0' : '1';
            nextBtn.style.pointerEvents = scrollLeft >= maxScroll - 10 ? 'none' : 'auto';
        });

        // Disparar evento inicial para ocultar prevBtn
        slider.dispatchEvent(new Event('scroll'));
    }
});
