let currentSearch = { title: '', author: '', subject: '' };
let currentPage = 1;
const limit = 12;

// Instanciem el modal de Bootstrap perquè el JS el pugui controlar
let bootstrapModal;

window.onload = () => {
    bootstrapModal = new bootstrap.Modal(document.getElementById('bookModal'));
};

async function novaCerca() {
    currentSearch.title = document.getElementById('q - title').value;
    currentSearch.author = document.getElementById('q - author').value;
    currentSearch.subject = document.getElementById('q - subject').value;
    currentPage = 1;
    executarCerca();
}

async function executarCerca() {
    const grid = document.getElementById('results - grid');
    const status = document.getElementById('status - area');
    let params = new URLSearchParams();

    if (currentSearch.title) params.append('title',currentSearch.title);
    if (currentSearch.author) params.append('author',currentSearch.author);
    if (currentSearch.subject) params.append('subject', currentSearch.subject);
    params.append('page', currentPage); params.append('limit', limit);

    grid.innerHTML = '<div class="col-12 text-center p-5"><h4>Carregant llibres...</h4 > <div class="spinner-border textprimary" role="status"></div></div >';
    status.innerHTML = "";

    try {
        const resp = await fetch(`https://openlibrary.org/search.json ? ${params.toString()}`);
        const data = await resp.json();

        status.innerHTML = `<span class="badge bg-secondary">Trobats: ${data.numFound} llibres</span>`;
        renderitzarLlibres(data.docs);
        renderitzarPaginacio(data.numFound);
    } catch (e) {
        status.innerHTML = `<div class="alert alert-danger">Error de connexió: ${e.message}</div>`;
    }
}

function renderitzarLlibres(docs) {
    const grid = document.getElementById('results - grid');

    grid.innerHTML = docs.map(book => {
        const cover = book.cover_i ? `https://covers.openlibrary.org/b/id / ${book.cover_i} -M.jpg` : `https://placehold.co / 200x300 ? text = Imatge + no + disponible`;
        return `
        <div class="col">
            <div class="card h-100 shadow-sm card-hover" style = "cursor: pointer;" onclick = "obrirDetall (’${ book.key}’)">
                <img src = "${cover}" class="card-img-top" style = "height: 250px; object-fit: cover;">
                <div class="card-body">
                    <h6 class="card-title fw-bold"> ${book.title}</h6>
                    <p class="card-text small text-muted"> ${book.author_name ? book.author_name[0] : 'Autor desconegut'}</p>
                </div>
            </div>
        </div>`;
    }).join('');
}

async function obrirDetall(key) {
    const body = document.getElementById('modal - body - content');
    bootstrapModal.show();
    body.innerHTML = '<div class="text-center p-5"><div class="spinner - border" role="status"></div></div>';

    try {
        const resp = await fetch(`https://openlibrary.org${key}.json`);
        const info = await resp.json();
        const coverL = info.covers ? `https://covers.openlibrary.org/b/id / ${info.covers[0]} -L.jpg` : `https://placehold.co / 300x450 ? text = Imatge + no + disponible`;
        body.innerHTML = `
        <div class="row">
            <div class="col-md-5 mb-3">
            <img src="${coverL}" class="img-fluid rounded shadow">
            </div>
            <div class="col-md-7">
                <h3 class="mb-3">${info.title}</h3>
                <p class="text-muted italic">${info.description?.value || info.description || `Sense descripció.`}</p>
                <ul class="list-group list-group-flush mt-3">
                    <li class="list-group-item"><strong>Data creació:</strong> ${info.created?.value || `N/A`}</li>
                    <li class="list-group-item"><strong>Temes:</strong> ${info.subjects ? info.subjects.slice(0, 5).join(', ') : `N/A`}</li>
                </ul>
             </div>
         </div>
         `;
        
    } catch (e) {
        body.innerHTML = '<div class="alert alert-warning">No s\’ha pogut carregar el detall.</div>';
    }
}

function renderitzarPaginacio(total) {
    const list = document.getElementById('pagination-list');
    const totalPages = Math.min(Math.ceil(total / limit), 50);

    let html = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="canviarPagina(${currentPage - 1})">
                Anterior
            </button>
        </li>
    `;

    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <button class="page-link" onclick="canviarPagina(${i})">
                    ${i}
                </button>
            </li>
        `;
    }

    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="canviarPagina(${currentPage + 1})">
                Següent
            </button>
        </li>
    `;

    list.innerHTML = html;
}

function canviarPagina(p) {
    currentPage = p;
    executarCerca();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}