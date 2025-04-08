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

// Remplacez la partie du code RSS dans main.js par celle-ci
document.addEventListener("DOMContentLoaded", function () {
  const feedContainer = document.getElementById("godot-feed");
  
  // Si le conteneur n'existe pas, ne rien faire
  if (!feedContainer) return;
  
  // Afficher un message de chargement
  feedContainer.innerHTML = '<div class="d-flex justify-content-center my-3"><div class="spinner-border text-light" role="status"><span class="visually-hidden">Chargement...</span></div></div>';
  
  // URL du flux RSS
  const rssUrl = "https://godotengine.org/rss.xml";
  
  // Utiliser un service de proxy CORS alternatif
  // Option 1: RSS2JSON avec HTTPS explicite
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
  
  // Option 2: Utiliser un autre service comme AllOrigins
  const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
  
  // Essayer d'abord avec rss2json
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error("Erreur réseau avec RSS2JSON");
      return response.json();
    })
    .then(data => {
      if (data.status !== "ok") throw new Error("Réponse API invalide");
      
      // Récupérer les articles
      const articles = data.items;
      
      if (!articles || articles.length === 0) {
        throw new Error("Aucun article trouvé dans la réponse");
      }
      
      // Créer le HTML pour les articles
      let output = '<div class="godot-articles">';
      
      // Afficher au maximum 5 articles
      for (let i = 0; i < Math.min(5, articles.length); i++) {
        const article = articles[i];
        
        // Créer une version courte de la description sans les balises HTML
        const shortDescription = article.description
          .replace(/<[^>]*>?/gm, '') // Enlever les balises HTML
          .substr(0, 150) + '...'; // Limiter la longueur
          
        // Formater la date
        const pubDate = new Date(article.pubDate).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        output += `
          <div class="card bg-dark text-light mb-3 border-secondary">
            <div class="card-body">
              <h5 class="card-title">
                <a href="${article.link}" target="_blank" class="text-decoration-none text-info">
                  ${article.title}
                </a>
              </h5>
              <p class="card-text">${shortDescription}</p>
              <p class="card-text"><small class="text-secondary">Publié le ${pubDate}</small></p>
            </div>
          </div>
        `;
      }
      
      output += '</div>';
      feedContainer.innerHTML = output;
    })
    .catch(error => {
      console.error("Erreur avec RSS2JSON, essai avec AllOrigins:", error);
      
      // Si rss2json échoue, essayer avec AllOrigins comme alternative
      fetch(allOriginsUrl)
        .then(response => {
          if (!response.ok) throw new Error("Erreur réseau avec AllOrigins");
          return response.text();
        })
        .then(xmlText => {
          // Parser le XML manuellement
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");
          
          // Extraire les informations du XML
          const items = xmlDoc.querySelectorAll("item");
          
          if (items.length === 0) {
            throw new Error("Aucun article trouvé dans le XML");
          }
          
          // Créer le HTML pour les articles
          let output = '<div class="godot-articles">';
          
          // Afficher au maximum 5 articles
          for (let i = 0; i < Math.min(5, items.length); i++) {
            const item = items[i];
            
            const title = item.querySelector("title").textContent;
            const link = item.querySelector("link").textContent;
            const description = item.querySelector("description").textContent;
            const pubDateText = item.querySelector("pubDate").textContent;
            
            // Créer une version courte de la description sans les balises HTML
            const shortDescription = description
              .replace(/<[^>]*>?/gm, '') // Enlever les balises HTML
              .substr(0, 150) + '...'; // Limiter la longueur
              
            // Formater la date
            const pubDate = new Date(pubDateText).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            output += `
              <div class="card bg-dark text-light mb-3 border-secondary">
                <div class="card-body">
                  <h5 class="card-title">
                    <a href="${link}" target="_blank" class="text-decoration-none text-info">
                      ${title}
                    </a>
                  </h5>
                  <p class="card-text">${shortDescription}</p>
                  <p class="card-text"><small class="text-secondary">Publié le ${pubDate}</small></p>
                </div>
              </div>
            `;
          }
          
          output += '</div>';
          feedContainer.innerHTML = output;
        })
        .catch(finalError => {
          console.error("Toutes les tentatives ont échoué:", finalError);
          
          // Afficher un message d'erreur final
          feedContainer.innerHTML = `
            <div class="alert alert-warning">
              <h4 class="alert-heading">Impossible de charger les articles</h4>
              <p>Désolé, nous ne pouvons pas récupérer les derniers articles du blog Godot pour le moment.</p>
              <hr>
              <p class="mb-0">Vous pouvez visiter directement <a href="https://godotengine.org/news/" target="_blank" class="alert-link">le blog Godot</a>.</p>
            </div>
          `;
        });
    });
});