// header and footer
function loadComponent(url, targetId) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Erreur de chargement (${response.status})`);
            return response.text();
        })
        .then(data => {
            document.getElementById(targetId).innerHTML = data;
            
            // Si c'est le header qui vient d'être chargé, on applique la logique de navigation active
            if (targetId === 'header') {
                setActiveNavLink();
            }
        })
        .catch(error => {
            console.error(`Problème de chargement du composant: ${error}`);
        });
}

// Fonction pour définir le lien actif dans la navigation
function setActiveNavLink() {
    // Obtenir le chemin de la page actuelle
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Sélectionner tous les liens de navigation
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Retirer la classe 'active' de tous les liens
    navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
    });
    
    // Ajouter la classe 'active' au lien correspondant à la page actuelle
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadComponent('header.html', 'header');
    loadComponent('footer.html', 'footer');
});

// Fonction pour ajouter un fond au header lors du défilement
window.addEventListener('scroll', function() {
    const header = document.querySelector('header.navbar');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// 1. Correction du JavaScript pour les points-mini
document.addEventListener('DOMContentLoaded', function() {
    const timelinePoints = document.querySelectorAll('.timeline-point');
    const timelineMiniPoints = document.querySelectorAll('.timeline-point-mini');
    const allPoints = [...timelinePoints, ...timelineMiniPoints]; // Ordre correct des points
    const timelineCards = document.querySelectorAll('.timeline-card');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    const progressLine = document.querySelector('.progress-line');
    
    let currentIndex = 0;
    
    function updateTimeline(index) {
      // Désactiver tous les points
      allPoints.forEach(point => point.classList.remove('active'));
      
      // Activer uniquement le point actuel
      allPoints[index].classList.add('active');
      
      // Mise à jour des cartes (uniquement pour les points principaux)
      const selectedPoint = allPoints[index];
      const isMainPoint = selectedPoint.classList.contains('timeline-point');
      
      if (isMainPoint) {
        const dataYear = selectedPoint.getAttribute('data-year');
        timelineCards.forEach(card => {
          card.classList.toggle('active', card.getAttribute('data-year') === dataYear);
        });
      } else {
        // Pour les mini-points, on trouve la carte la plus proche
        const dataMonth = selectedPoint.getAttribute('data-month');
        const [month, year] = dataMonth.split('-');
        timelineCards.forEach(card => {
          card.classList.toggle('active', card.getAttribute('data-year') === year);
        });
      }
      
      // Mise à jour de la ligne de progression
      const pointPosition = parseFloat(getComputedStyle(allPoints[index]).left);
      const trackWidth = parseFloat(getComputedStyle(document.querySelector('.timeline-track')).width);
      const progressPercentage = (pointPosition / trackWidth) * 100;
      progressLine.style.width = `${progressPercentage}%`;
      
      // Activation/désactivation des flèches
      prevArrow.disabled = index === 0;
      nextArrow.disabled = index === allPoints.length - 1;
      
      currentIndex = index;
    }
    
    // Ajout d'écouteurs d'événements pour tous les points
    allPoints.forEach((point, index) => {
      point.addEventListener('click', () => {
        updateTimeline(index);
      });
    });
    
    // Gestion des flèches
    prevArrow.addEventListener('click', () => {
      if (currentIndex > 0) updateTimeline(currentIndex - 1);
    });
    
    nextArrow.addEventListener('click', () => {
      if (currentIndex < allPoints.length - 1) updateTimeline(currentIndex + 1);
    });
    
    // Initialisation
    updateTimeline(0);
});