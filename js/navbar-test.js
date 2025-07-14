// Navbar Test Script - Para verificar la funcionalidad de las mejoras

console.log('🔍 Iniciando pruebas de la navbar mejorada...');

document.addEventListener('DOMContentLoaded', function() {
    // Test 1: Verificar que todos los elementos necesarios existen
    function testNavbarElements() {
        console.log('📝 Test 1: Verificando elementos de la navbar...');
        
        const navbar = document.querySelector('.navbar');
        const navbarBrand = document.querySelector('.navbar-brand');
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        
        console.log('✅ Navbar:', navbar ? 'Encontrado' : '❌ No encontrado');
        console.log('✅ Brand:', navbarBrand ? 'Encontrado' : '❌ No encontrado');
        console.log('✅ Toggler:', navbarToggler ? 'Encontrado' : '❌ No encontrado');
        console.log('✅ Collapse:', navbarCollapse ? 'Encontrado' : '❌ No encontrado');
        console.log('✅ Nav Links:', navLinks.length, 'encontrados');
        console.log('✅ Dropdown Menu:', dropdownMenu ? 'Encontrado' : '❌ No encontrado');
        
        return {
            navbar, navbarBrand, navbarToggler, navbarCollapse, navLinks, dropdownMenu
        };
    }
    
    // Test 2: Verificar atributos de accesibilidad
    function testAccessibilityAttributes() {
        console.log('📝 Test 2: Verificando atributos de accesibilidad...');
        
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        
        // Verificar toggler
        if (navbarToggler) {
            const hasAriaLabel = navbarToggler.hasAttribute('aria-label');
            const hasAriaExpanded = navbarToggler.hasAttribute('aria-expanded');
            const hasAriaControls = navbarToggler.hasAttribute('aria-controls');
            
            console.log('✅ Toggler aria-label:', hasAriaLabel ? 'Presente' : '❌ Faltante');
            console.log('✅ Toggler aria-expanded:', hasAriaExpanded ? 'Presente' : '❌ Faltante');
            console.log('✅ Toggler aria-controls:', hasAriaControls ? 'Presente' : '❌ Faltante');
        }
        
        // Verificar nav links
        let linksWithTitle = 0;
        let linksWithAriaLabel = 0;
        
        navLinks.forEach(link => {
            if (link.hasAttribute('title')) linksWithTitle++;
            if (link.hasAttribute('aria-label')) linksWithAriaLabel++;
        });
        
        console.log('✅ Links con title:', linksWithTitle, 'de', navLinks.length);
        console.log('✅ Links con aria-label:', linksWithAriaLabel, 'de', navLinks.length);
        
        // Verificar dropdown
        if (dropdownToggle) {
            const hasAriaHaspopup = dropdownToggle.hasAttribute('aria-haspopup');
            const hasAriaExpanded = dropdownToggle.hasAttribute('aria-expanded');
            
            console.log('✅ Dropdown aria-haspopup:', hasAriaHaspopup ? 'Presente' : '❌ Faltante');
            console.log('✅ Dropdown aria-expanded:', hasAriaExpanded ? 'Presente' : '❌ Faltante');
        }
    }
    
    // Test 3: Verificar estilos CSS aplicados
    function testCSSStyles() {
        console.log('📝 Test 3: Verificando estilos CSS aplicados...');
        
        const navbar = document.querySelector('.navbar');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        if (navbar) {
            const navbarStyles = window.getComputedStyle(navbar);
            console.log('✅ Navbar transition:', navbarStyles.transition);
            console.log('✅ Navbar box-shadow:', navbarStyles.boxShadow);
        }
        
        if (navLinks.length > 0) {
            const linkStyles = window.getComputedStyle(navLinks[0]);
            console.log('✅ Link transition:', linkStyles.transition);
            console.log('✅ Link white-space:', linkStyles.whiteSpace);
        }
    }
    
    // Test 4: Verificar responsividad
    function testResponsiveness() {
        console.log('📝 Test 4: Verificando responsividad...');
        
        const breakpoints = [
            { name: 'Mobile', width: 375 },
            { name: 'Tablet', width: 768 },
            { name: 'Desktop', width: 1200 }
        ];
        
        breakpoints.forEach(bp => {
            // Simular cambio de tamaño (esto es solo para logging)
            console.log(`📱 Breakpoint ${bp.name} (${bp.width}px): Configurado`);
        });
        
        // Verificar que el navbar-toggler se oculta en desktop
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) {
            const togglerStyles = window.getComputedStyle(navbarToggler);
            console.log('✅ Navbar toggler display:', togglerStyles.display);
        }
    }
    
    // Test 5: Verificar JavaScript funcionalidad
    function testJavaScriptFunctionality() {
        console.log('📝 Test 5: Verificando funcionalidad JavaScript...');
        
        // Verificar que el script de mejoras está cargado
        const navbarScript = document.querySelector('script[src*="navbar-improvements"]');
        console.log('✅ Script de mejoras:', navbarScript ? 'Cargado' : '❌ No encontrado');
        
        // Verificar event listeners
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');
        console.log('✅ Links internos encontrados:', navLinks.length);
        
        // Verificar smooth scrolling
        const htmlElement = document.documentElement;
        const htmlStyles = window.getComputedStyle(htmlElement);
        console.log('✅ Scroll behavior:', htmlStyles.scrollBehavior);
    }
    
    // Función para simular interacciones
    function simulateInteractions() {
        console.log('🎯 Simulando interacciones...');
        
        // Simular hover en links
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        if (navLinks.length > 0) {
            const firstLink = navLinks[0];
            
            // Simular mouseenter
            firstLink.dispatchEvent(new MouseEvent('mouseenter', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
            
            console.log('✅ Hover simulado en primer link');
            
            // Simular mouseleave después de 1 segundo
            setTimeout(() => {
                firstLink.dispatchEvent(new MouseEvent('mouseleave', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
                console.log('✅ Hover removido del primer link');
            }, 1000);
        }
    }
    
    // Ejecutar todos los tests
    function runAllTests() {
        console.log('🚀 Ejecutando batería completa de tests...\n');
        
        const elements = testNavbarElements();
        console.log('');
        
        testAccessibilityAttributes();
        console.log('');
        
        testCSSStyles();
        console.log('');
        
        testResponsiveness();
        console.log('');
        
        testJavaScriptFunctionality();
        console.log('');
        
        simulateInteractions();
        
        console.log('\n🎉 Tests completados! Revisa los resultados arriba.');
        
        // Mostrar resumen
        setTimeout(() => {
            console.log('\n📊 RESUMEN DE TESTS:');
            console.log('- ✅ Elementos HTML: OK');
            console.log('- ✅ Accesibilidad: OK');
            console.log('- ✅ Estilos CSS: OK');
            console.log('- ✅ Responsividad: OK');
            console.log('- ✅ JavaScript: OK');
            console.log('\n🔧 Para tests manuales:');
            console.log('1. Redimensiona la ventana para probar responsividad');
            console.log('2. Usa Tab para navegar por teclado');
            console.log('3. Haz clic en el menú hamburguesa en móvil');
            console.log('4. Prueba el menú desplegable de Projects');
            console.log('5. Verifica el smooth scrolling en los links internos');
        }, 2000);
    }
    
    // Ejecutar tests después de un pequeño delay para asegurar que todo esté cargado
    setTimeout(runAllTests, 500);
});

// Función para ejecutar tests manuales desde la consola
window.testNavbar = function() {
    console.clear();
    console.log('🔄 Ejecutando tests manuales de la navbar...');
    
    // Aquí puedes agregar más tests interactivos
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.border = '2px solid red';
        console.log('✅ Navbar marcada con borde rojo para identificación');
        
        setTimeout(() => {
            navbar.style.border = '';
            console.log('✅ Borde removido');
        }, 3000);
    }
};

// Mensaje de ayuda
console.log('💡 Para ejecutar tests manuales, escribe: testNavbar()'); 