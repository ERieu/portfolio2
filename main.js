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

// Code mis à jour pour la timeline
document.addEventListener('DOMContentLoaded', function() {
const timelinePoints = document.querySelectorAll('.timeline-point');
const timelineCards = document.querySelectorAll('.timeline-card');
const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');
const progressLine = document.querySelector('.progress-line');

let currentIndex = 0;

function updateTimeline(index) {

  timelinePoints.forEach((point, i) => {
    point.classList.toggle('active', i === index);
  });
  
  // Mettre à jour la carte active
  timelineCards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });
  
  // Mettre à jour la ligne de progression (ajustement pour qu'elle s'étende correctement)
  // Pour 5 points, chaque étape correspond à 25% de la largeur totale
  progressLine.style.width = `${(index / (timelinePoints.length - 1)) * 100}%`;
  
  prevArrow.disabled = index === 0;
  nextArrow.disabled = index === timelinePoints.length - 1;
  
  currentIndex = index;
}

timelinePoints.forEach((point, index) => {
  point.addEventListener('click', () => updateTimeline(index));
});

prevArrow.addEventListener('click', () => {
  if (currentIndex > 0) updateTimeline(currentIndex - 1);
});

nextArrow.addEventListener('click', () => {
  if (currentIndex < timelinePoints.length - 1) updateTimeline(currentIndex + 1);
});

// Initialiser la timeline
updateTimeline(0);
});

fetch("https://api.rss2json.com/v1/api.json?rss_url=https://godotengine.org/news/index.xml")
  .then(res => res.json())
  .then(data => {
    let output = '<ul class="list-group">';
    data.items.slice(0, 5).forEach(item => {
      output += `
        <li class="list-group-item">
          <a href="${item.link}" target="_blank" class="fw-bold">${item.title}</a>
          <br>
          <small class="text-muted">${new Date(item.pubDate).toLocaleDateString()}</small>
        </li>`;
    });
    output += '</ul>';
    const feedElement = document.getElementById("godot-feed");
    if (feedElement) {
      feedElement.innerHTML = output;
    }
  })
  .catch(error => {
    console.error("Erreur lors du chargement du flux RSS :", error);
    const feedElement = document.getElementById("godot-feed");
    if (feedElement) {
      feedElement.innerText = "Impossible de charger les articles.";
    }
  });