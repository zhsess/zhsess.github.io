document.addEventListener('DOMContentLoaded', function() {
    var portfolioContainer = document.querySelector('.portfolio-container');
    if (portfolioContainer) {
      var iso = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows',
        filter: '.filter-all'
      });
  
      document.querySelectorAll('#portfolio-flters li').forEach(function(filter) {
        filter.addEventListener('click', function() {
          document.querySelector('#portfolio-flters .filter-active').classList.remove('filter-active');
          this.classList.add('filter-active');
          iso.arrange({ filter: this.getAttribute('data-filter') });
        });
      });
    }
  });