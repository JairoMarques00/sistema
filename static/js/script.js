// Controla a navegação do menu lateral e troca o conteúdo do iframe.

document.addEventListener('DOMContentLoaded', () => {
  // Busca elementos do DOM que já existem na página principal (index.html)
  const navLinks = document.querySelectorAll('#mainNav .nav-link');
  const iframe = document.getElementById('contentFrame');
  const title = document.getElementById('contentTitle');

  // Se o iframe ou os links não existirem (página fora do painel), não faz nada.
  if (!iframe || !navLinks.length) return;

  // Marca um item de menu como ativo (destacado)
  function setActive(link) {
    navLinks.forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
  }

  // Atualiza o src do iframe e o título da seção
  function updateContent(link) {
    const src = link.dataset.src;
    if (!src) return;
    iframe.src = src;
    title.textContent = link.textContent.trim();
  }

  // Adiciona o evento de clique em cada link do menu
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setActive(link);
      updateContent(link);
    });
  });
});
