let currentSearch = { title: ’’, author: ’’, subject: ’’ };
2 let currentPage = 1;
3 const limit = 12;
4
5 // Instanciem el modal de Bootstrap perquè el JS el pugui
controlar
6 let bootstrapModal;
7
8 window.onload = () => {
    9 bootstrapModal = new bootstrap.Modal(document.getElementById
        (’bookModal’));
    10
};
11
12 async function novaCerca() {
    13 currentSearch.title = document.getElementById(’q - title’).
        value;
    14 currentSearch.author = document.getElementById(’q - author’).
        value;
    15 currentSearch.subject = document.getElementById(’q - subject’)
        .value;
    16 currentPage = 1;
    17 executarCerca();
    18
}
19
20 async function executarCerca() {
    21 const grid = document.getElementById(’results - grid’);
    22 const status = document.getElementById(’status - area’);
    23
    24 let params = new URLSearchParams();
    25 if (currentSearch.title) params.append(’title’,
        currentSearch.title);
    26 if (currentSearch.author) params.append(’author’,
        currentSearch.author);
    if (currentSearch.subject) params.append(’subject’,
        currentSearch.subject);
    28 params.append(’page’, currentPage); params.append(’limit’,
        limit);
    29
    30 grid.innerHTML = ’<div class="col-12 text-center p-5"><h4>
        Carregant llibres...</h4><div class="spinner-border textprimary" role="status"></div></div>’;
    31 status.innerHTML = "";
    32
    33 try {
        34 const resp = await fetch(‘https://openlibrary.org/search
.json ? ${ params.toString()
    }‘);
    35 const data = await resp.json();
    36
    37 status.innerHTML = ‘<span class="badge bg-secondary">
        Trobats: ${data.numFound} llibres</span>‘;
    38 renderitzarLlibres(data.docs);
    39 renderitzarPaginacio(data.numFound);
    40
} catch (e) {
    41 status.innerHTML = ‘<div class="alert alert-danger">
        Error de connexió: ${e.message}</div>‘;
    42
}
43 }
44
45 function renderitzarLlibres(docs) {
    46 const grid = document.getElementById(’results - grid’);
    47 grid.innerHTML = docs.map(book => {
        48 const cover = book.cover_i ? ‘https://covers.openlibrary
.org/b/id / ${ book.cover_i } -M.jpg‘ : ’https://placehold
.co / 200x300 ? text = Imatge + no + disponible’;
        49 return ‘
        50 < div class="col" >
            51 < div class="card h-100 shadow-sm card-hover"
        style = "cursor: pointer;" onclick = "obrirDetall
            (’${ book.key }’)">
        52 < img src = "${cover}" class="card-img-top"
        style = "height: 250px; object-fit: cover
            ; ">
        53 < div class="card-body" >
            54 < h6 class="card-title fw-bold" > ${
                book.
                    title
        }</h6 >
            55 < p class="card-text small text-muted" > ${
            book.author_name ? book.author_name
            [0] : ’Autor desconegut’
        }</p >
            56 </div >
                57 </div >
                    58 </div >
                        59 ‘;
        60
    }).join(’’);
    61
}
62
63 async function obrirDetall(key) {
    64 const body = document.getElementById(’modal - body - content’);
    65 bootstrapModal.show();
    66 body.innerHTML = ’<div class="text-center p-5"><div class="
spinner-border" role="status"></div></div>’;
    67
    68 try {
        69 const resp = await fetch(‘https://openlibrary.org${key}.
            json‘);
        70 const info = await resp.json();
        const coverL = info.covers ? ‘https://covers.openlibrary
.org/b/id / ${ info.covers[0] } -L.jpg‘ : ’https://
        placehold.co / 300x450 ? text = Imatge + no + disponible’;
        73 body.innerHTML = ‘ <div class="row">
            74 <div class="col-md-5 mb-3">
                75 <img src="${coverL}" class="img-fluid
rounded shadow">
                    76 </div>
            77 <div class="col-md-7">
                78 <h3 class="mb-3">${info.title}</h3>
                79 <p class="text-muted italic">${info.
                    description?.value || info.description ||
’Sense descripció.’}</p>
                80 <ul class="list-group list-group-flush mt
-3">
                    81 <li class="list-group-item"><strong>Data
                        creació:</strong> ${info.created?.
                            value || ’N/A’}</li>
                    82 <li class="list-group-item"><strong>
                        Temes:</strong> ${info.subjects ?
                            info.subjects.slice(0, 5).join(’, ’)
: ’N/A’}</li>
                    83 </ul>
                84 </div>
            85 </div>
        86 ‘;
        87
    } catch (e) {
        88 body.innerHTML = ’<div class="alert alert-warning">No s
            \’ha pogut carregar el detall.</div>’;
        89
    }
    90
}
91
92 function renderitzarPaginacio(total) {
    93 const list = document.getElementById(’pagination - list’);
    94 const totalPages = Math.min(Math.ceil(total / limit), 50);
    // Màxim 50 per no saturar
    95
    96 let html = ‘<li class="page-item ${currentPage === 1 ? ’
disabled’ : ’’}">
        97 <button class="page-link" onclick="
canviarPagina(${currentPage - 1})">
            Anterior</button>
        98 </li>‘;
    99
    100 for (let i = Math.max(1, currentPage - 2); i <= Math.min(
        totalPages, currentPage + 2); i++) {
        101 html += ‘<li class="page-item ${i === currentPage ? ’
active’ : ’’}">
            102 <button class="page-link" onclick="
canviarPagina(${i})">${i}</button>
            103 </li>‘;
        104
    }
    105
    106 html += ‘<li class="page-item ${currentPage === totalPages ?
’disabled’ : ’’}">
        107 <button class="page-link" onclick="canviarPagina
(${currentPage + 1})">Següent</button>
        108 </li>‘;
    109 list.innerHTML = html;
    110
}
111
112 function canviarPagina(p) {
    113 currentPage = p;
    executarCerca();
    115 window.scrollTo({ top: 300, behavior: ’smooth’ });
}