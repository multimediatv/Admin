/* lista_categorias.js */
// ==========================================
// MÃ“DULO LISTA DE CATEGORÃAS (SUBMENÃš SIDEBAR)
// Despliega categorÃ­as en el menÃº lateral. Al hacer clic abre una PESTAÃ‘A DEDICADA
// FIX: Lectura real de permisos desde la BD para habilitar eliminaciÃ³n masiva.
// ==========================================

let estadoSubmenuCategorias = false;
let categoriasDataLocal = [];
let cuentasBaseGlobal = [];
let cat_permisosActivos = []; // ðŸ’¡ FIX: Variable global para guardar los permisos del trabajador

// Variables de estado para la PestaÃ±a (EdiciÃ³n de Tabla)
let idCategoriaAbierta = null;
let cuentasEditando = [];
let pageCatActual = 1;
let limitCatActual = 10;
let searchCatTexto = "";
let sortCatConsultaDir = 'asc';

// ==========================================
// 1. INYECTAR CSS DINÃMICO
// ==========================================
if (!document.getElementById('style-submenu-categorias')) {
    const style = document.createElement('style');
    style.id = 'style-submenu-categorias';
    style.textContent = `
        /* --- ESTILOS DEL SUBMENÃš (Heredados del sistema) --- */
        .cat-dot-menu { width: 12px; height: 12px; border-radius: 50%; display: inline-block; border: 1px solid rgba(255,255,255,0.2); }
        .submenu-item-btn.cat-btn { padding-left: 35px; }
        
        /* --- ESTILOS DE LA PESTAÃ‘A DEDICADA CATEGORÃA --- */
        .cat-tab-wrapper { animation: fadeIn 0.4s ease; padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: 'Inter', sans-serif; }
        .cat-tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border); flex-wrap: wrap; gap: 15px;}
        .cat-tab-header h2 { font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 12px; }
        .cat-tab-header h2 i { font-size: 2.2rem; }
        
        .cat-header-actions { display: flex; gap: 10px; }
        .btn-cat-outline { background: transparent; border: 1px solid var(--border); color: var(--text-main); padding: 8px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-cat-outline:hover { background: rgba(255,255,255,0.05); border-color: var(--text-muted); }
        
        /* Secciones Internas */
        .cat-section-card { background: var(--bg-card); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow); margin-bottom: 2rem; }
        .cat-section-title { font-size: 0.9rem; font-weight: 800; text-transform: uppercase; color: var(--text-main); margin-top: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; letter-spacing: 0.05em; }
        .cat-section-title i { color: var(--primary); font-size: 1.3rem; }

        /* Ãrea de Carga Masiva (Dentro de la PestaÃ±a) */
        .cat-masivo-container { background: var(--bg-body); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s; }
        .cat-masivo-container:focus-within { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15); }
        .cat-masivo-header { background: rgba(0,0,0,0.03); border-bottom: 1px solid var(--border); padding: 8px 15px; font-family: monospace; font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between; }
        .cat-masivo-textarea { width: 100%; height: 120px; border: none; background: transparent; padding: 15px; color: var(--text-main); font-family: 'Share Tech Mono', monospace; font-size: 0.95rem; line-height: 1.6; outline: none; resize: vertical; box-sizing: border-box; white-space: pre; }
        
        .btn-cat-add { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 15px; width: 100%; }
        .btn-cat-add:hover { background: #10b981; color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }

        /* Barra Filtro Tabla y Acciones Masivas */
        .cat-filter-bar { display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed var(--border); }
        .cat-search-box { position: relative; flex: 1; min-width: 250px; max-width: 400px; }
        .cat-search-box i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 1.2rem; }
        .cat-search-box input { width: 100%; padding: 10px 15px 10px 40px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-main); font-size: 0.9rem; outline: none; transition: 0.3s; box-sizing: border-box; }
        .cat-search-box input:focus { border-color: var(--primary); }
        .cat-select-limit { padding: 9px 12px; border-radius: 8px; background: var(--bg-body); border: 1px solid var(--border); color: var(--text-main); font-size: 0.85rem; font-weight: 600; outline: none; cursor: pointer; }

        .btn-trash-bulk { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 9px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; }
        .btn-trash-bulk:hover:not(:disabled) { background: #ef4444; color: white; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); }
        .btn-trash-bulk:disabled { opacity: 0.5; cursor: not-allowed; border-color: transparent; }

        /* Estructura Tabla EdiciÃ³n */
        .cat-table-scroll { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-body); }
        .cuentas-edit-table { width: 100%; border-collapse: collapse; min-width: 850px; }
        .cuentas-edit-table th { background: rgba(0,0,0,0.03); padding: 12px; text-align: left; font-size: 0.75rem; color: var(--text-muted); border-bottom: 2px solid var(--border); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; white-space: nowrap; }
        .cuentas-edit-table td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; transition: background 0.2s; }
        .cuentas-edit-table tr:hover td { background: rgba(255,255,255,0.02); }
        .cuentas-edit-table tr:last-child td { border-bottom: none; }
        
        .cat-row-checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: #ef4444; display: block; margin: 0 auto; }

        .input-dblclick { width: 100%; background: transparent; border: 1px dashed transparent; color: var(--text-main); font-family: 'Inter', monospace; font-size: 0.85rem; padding: 8px; border-radius: 8px; outline: none; transition: all 0.2s; cursor: pointer; text-overflow: ellipsis; box-sizing: border-box; }
        .input-dblclick:hover { background: rgba(255,255,255,0.04); border-color: var(--border); }
        .input-dblclick:not([readonly]) { background: var(--bg-card); border: 1px solid var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); cursor: text; }
        
        .input-pin { width: 55px; background: rgba(0,0,0,0.03); border: 1px solid var(--border); color: var(--text-main); padding: 8px 4px; border-radius: 6px; text-align: center; font-weight: 800; font-family: monospace; font-size: 0.85rem; outline: none; transition: all 0.3s; letter-spacing: 1px; box-sizing: border-box; }
        .input-pin:focus { border-color: var(--primary); background: var(--bg-card); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); transform: translateY(-2px); }
        
        .btn-trash-sm { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; }
        .btn-trash-sm:hover { background: #ef4444; color: white; transform: scale(1.05); box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); }

        /* Paginador y BotÃ³n Guardar */
        .cat-tab-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 15px; }
        .lc-pagination { display: flex; align-items: center; gap: 8px; }
        .lc-page-btn { width: 32px; height: 32px; border-radius: 8px; background: var(--bg-body); border: 1px solid var(--border); color: var(--text-main); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .lc-page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .lc-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        
        .btn-cat-save-final { background: var(--primary); color: white; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.3s; box-shadow: 0 6px 12px rgba(99, 102, 241, 0.25); margin-left: auto; }
        .btn-cat-save-final:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 8px 16px rgba(99, 102, 241, 0.35); }
    `;
    document.head.appendChild(style);
}

// ==========================================
// 2. LÃ“GICA DEL MENÃš LATERAL (SIDEBAR)
// ==========================================
window.toggleSubmenuCategorias = function() {
    const submenu = document.getElementById('submenu-categorias');
    const flecha = document.getElementById('icono-flecha-categorias');
    
    estadoSubmenuCategorias = !estadoSubmenuCategorias;
    
    if (estadoSubmenuCategorias) {
        submenu.style.display = 'block';
        flecha.style.transform = 'rotate(180deg)';
        cargarSubmenuCategorias();
    } else {
        submenu.style.display = 'none';
        flecha.style.transform = 'rotate(0deg)';
    }
};

async function cargarSubmenuCategorias() {
    const token = localStorage.getItem('nexus_token');
    const submenu = document.getElementById('submenu-categorias');
    if (!token) return;

    const usr_rolActivo = localStorage.getItem('nexus_rol') || 'cliente';
    const miCorreo = localStorage.getItem('nexus_usuario');
    
    let btnAgregarHTML = '';
    if (usr_rolActivo === 'admin') {
        btnAgregarHTML = `
            <li style="border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 5px; padding-bottom: 5px;">
                <button class="submenu-item-btn cat-btn" onclick="window.cargarVistaAdminGlobal('agregar_categoria');">
                    <i class='bx bx-plus-circle submenu-item-icon' style="color: var(--primary);"></i> 
                    <span class="submenu-item-text" style="font-weight: 700;">Agregar CategorÃ­a</span>
                </button>
            </li>
        `;
    }

    const renderData = (data) => {
        categoriasDataLocal = data.categorias;
        if(data.cuentas_base) cuentasBaseGlobal = data.cuentas_base;
        
        if (categoriasDataLocal.length === 0) {
            submenu.innerHTML = btnAgregarHTML + `<li style="padding: 10px 15px 10px 45px; color: var(--text-muted); font-size: 0.8rem;"><i class='bx bx-info-circle'></i> No hay categorÃ­as</li>`;
            return;
        }

        let html = btnAgregarHTML;
        categoriasDataLocal.forEach(cat => {
            const colorCode = cat.color || '#006aff';
            html += `
                <li>
                    <button class="submenu-item-btn cat-btn" onclick="abrirPestanaCategoria(${cat.id}); activarMenu(document.getElementById('nav-lista-categorias'));">
                        <span class="cat-dot-menu" style="background-color: ${colorCode};"></span>
                        <span class="submenu-item-text">${cat.nombre}</span>
                    </button>
                </li>
            `;
        });
        submenu.innerHTML = html;
    };

    const cacheLocal = localStorage.getItem('cache_lista_categorias');
    if (cacheLocal) {
        try { renderData(JSON.parse(cacheLocal)); } catch(e){}
    } else {
        submenu.innerHTML = `<li style="padding: 10px 15px; color: var(--text-muted); font-size: 0.8rem; text-align: center;"><i class='bx bx-loader-alt bx-spin'></i> Cargando...</li>`;
    }

    // ðŸ’¡ FIX IMPORTANTE: Si es trabajador, obtenemos sus permisos REALES (con cachÃ© o fetch)
    if (usr_rolActivo === 'trabajador') {
        try {
            const cacheTrabajadores = localStorage.getItem('cache_lista_trabajadores');
            let dataUsr = cacheTrabajadores ? JSON.parse(cacheTrabajadores) : null;
            if (!dataUsr) {
                const resUsr = await fetch(API_BASE + 'api_usuarios.php?action=getUsuarios', { headers: { 'Authorization': `Bearer ${token}` } });
                dataUsr = await resUsr.json();
            }
            if (dataUsr && dataUsr.success) {
                const yo = dataUsr.usuarios.find(u => u.correo === miCorreo);
                if (yo && yo.permisos) {
                    try { cat_permisosActivos = JSON.parse(yo.permisos); } catch(e){}
                }
            }
        } catch(e) { console.error("Error cargando permisos del trabajador."); }
    }

    try {
        const res = await fetch(API_BASE + 'api_categorias.php?action=list', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('cache_lista_categorias', JSON.stringify(data));
            renderData(data);
        } else if (!cacheLocal) {
            submenu.innerHTML = `<li style="padding: 10px 15px; color: #ef4444; font-size: 0.8rem; text-align: center;">Error al cargar</li>`;
        }
    } catch (e) {
        if (!cacheLocal) submenu.innerHTML = `<li style="padding: 10px 15px; color: #ef4444; font-size: 0.8rem; text-align: center;">Fallo de red</li>`;
    }
}

// ==========================================
// 3. LÃ“GICA DE LA PESTAÃ‘A DEDICADA DE CATEGORÃA
// ==========================================
window.abrirPestanaCategoria = function(catId) {
    const content = document.getElementById('admin-content');
    const cat = categoriasDataLocal.find(c => c.id == catId);
    
    if (!cat) {
        alert("No se pudo cargar la informaciÃ³n de esta categorÃ­a.");
        return;
window.abrirCategoriaTab = async function(id) {
    idCategoriaAbierta = id;
    const cat = categoriasDataLocal.find(c => c.id === id);
    if (!cat) return;

    // ... cÃ³digo de apertura ...
    if(typeof UI !== 'undefined' && UI.ocultarSidebar) UI.ocultarSidebar();

    const container = document.getElementById('admin-content');
    
    // Preparar el array editable
    try {
        const arrCorreos = JSON.parse(cat.correos || "[]");
        if (Array.isArray(arrCorreos)) {
            cuentasEditando = arrCorreos.map((item, index) => {
                if (typeof item === 'string') return { idOriginal: index, correo: item, correo_original: item, clave: '', consulta: '', p1: '', p2: '', p3: '', p4: '' };
                item.correo_original = item.correo; 
                item.idOriginal = index;
                return item;
            });
    // ðŸ’¡ FIX: Usamos el array cat_permisosActivos que llenamos al abrir el menÃº y aceptamos 'eliminar_cuentas' o 'eliminar_usuarios'
    const puedeEliminar = (usr_rolActivo === 'admin' || cat_permisosActivos.includes('eliminar_cuentas') || cat_permisosActivos.includes('eliminar_usuarios'));

    const colorBadge = cat.color || 'var(--primary)';

    content.innerHTML = `
        <datalist id="lista-datalist-cuentas-cat"></datalist>

        <div class="cat-tab-wrapper">
            <div class="cat-tab-header">
                <h2><i class='bx bx-layer' style="color: ${colorBadge};"></i> <span>GestiÃ³n: <b>${cat.nombre}</b></span></h2>
                <div class="cat-header-actions">
                    <button class="btn-cat-outline" onclick="activarMenu(document.getElementById('nav-lista-categorias')); abrirAgregarCategoria().then(() => ac_editar(${cat.id}));">
                        <i class='bx bx-slider-alt'></i> Ajustes Base
                    </button>
                    ${puedeEliminar ? `
                    <button class="btn-cat-outline" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);" onclick="if(typeof PapeleraEngine !== 'undefined') PapeleraEngine.abrirPapelera('signup', ${cat.id}); else alert('MÃ³dulo de Papelera no cargado');">
                        <i class='bx bx-trash'></i> Papelera
                    </button>
                    ` : ''}
                </div>
            </div>

            <div class="cat-section-card">
                <h4 class="cat-section-title"><i class='bx bx-code-block'></i> Bloque 1: AÃ±adir Cuentas a la CategorÃ­a</h4>
                <div class="cat-masivo-container">
                    <div class="cat-masivo-header">
                        <span>Formato: correo:contraseÃ±a</span>
                        <span>Salto de lÃ­nea por cuenta</span>
                    </div>
                    <textarea id="txt-masivo-cat-tab" class="cat-masivo-textarea" placeholder="ejemplo1@gmail.com:Clave123&#10;ejemplo2@outlook.com:Pass456"></textarea>
                </div>
                <button type="button" class="btn-cat-add" id="btn-save-nuevas" onclick="guardarNuevasCuentasIncremental()">
                    <i class='bx bx-plus-circle'></i> Guardar y AÃ±adir Cuentas
                </button>
            </div>

            <div class="cat-section-card" id="bloque-eliminar" style="display:none; border: 1px solid #ef4444; background: rgba(239,68,68,0.02);">
                <h4 class="cat-section-title" style="color: #ef4444;"><i class='bx bx-trash'></i> Bloque 2: Cuentas en Cola para Eliminar</h4>
                <div class="cat-table-scroll" style="max-height: 200px; margin-bottom: 15px; border-radius: 8px;">
                    <table class="cuentas-edit-table">
                        <thead>
                            <tr>
                                <th style="width: 40%;"><i class='bx bx-envelope'></i> Correo Cliente</th>
                                <th><i class='bx bx-radar'></i> Bandeja Maestra</th>
                                <th style="text-align:center; width:60px;">Revertir</th>
                            </tr>
                        </thead>
                        <tbody id="cat-tbody-eliminar">
                        </tbody>
                    </table>
                </div>
                <button type="button" class="btn-cat-save-final" id="btn-save-eliminar" style="background: #ef4444; margin-top:0;" onclick="guardarEliminacionesIncremental()">
                    <i class='bx bx-check-double' style="font-size:1.3rem;"></i> Confirmar EliminaciÃ³n
                </button>
            </div>

            <div class="cat-section-card">
                <h4 class="cat-section-title"><i class='bx bx-data'></i> Bloque 3: Cuentas Actuales (EdiciÃ³n)</h4>
                
                <div class="cat-filter-bar">
                    <div class="cat-search-box">
                        <i class='bx bx-search'></i>
                        <input type="text" id="cat-search-input" placeholder="Buscar correo, clave o bandeja..." onkeyup="buscarCuentasTab()">
                    </div>
                    <div style="display:flex; align-items:center; gap: 10px;">
                        ${puedeEliminar ? `<button id="btn-bulk-delete" class="btn-trash-bulk" onclick="borrarSeleccionadosTab()" disabled><i class='bx bx-trash'></i> Mover a Eliminar</button>` : ''}
                        <span style="font-size: 0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">LÃ­mite:</span>
                        <select id="cat-limit-select" class="cat-select-limit" onchange="cambiarLimiteTab()">
                            <option value="10">10 registros</option>
                            <option value="25">25 registros</option>
                            <option value="50">50 registros</option>
                            <option value="999">Todos</option>
                        </select>
                    </div>
                </div>

                <div class="cat-table-scroll">
                    <table class="cuentas-edit-table">
                        <thead>
                            <tr>
                                ${puedeEliminar ? `<th style="text-align: center; width:40px;"><input type="checkbox" id="cat-select-all" class="cat-row-checkbox" onclick="toggleAllCatCuentas(this)" title="Seleccionar todo"></th>` : ''}
                                <th style="width: 25%;"><i class='bx bx-envelope'></i> Correo Cliente</th>
                                <th style="width: 15%;"><i class='bx bx-key'></i> Clave</th>
                                <th style="cursor: pointer; color: var(--primary); text-align: left; width: 22%; transition: color 0.2s;" onclick="ordenarCuentasTabPorConsulta()" title="Clic para ordenar">
                                    <i class='bx bx-radar'></i> Bandeja Maestra <i class='bx bx-sort'></i>
                                </th>
                                <th style="text-align: center;" title="Perfil 1">P1</th>
                                <th style="text-align: center;" title="Perfil 2">P2</th>
                                <th style="text-align: center;" title="Perfil 3">P3</th>
                                <th style="text-align: center;" title="Perfil 4">P4</th>
                                ${puedeEliminar ? `<th style="text-align: center; width:50px;"><i class='bx bx-trash'></i></th>` : ''}
                            </tr>
                        </thead>
                        <tbody id="cat-tbody-cuentas">
                        </tbody>
                    </table>
                </div>

                <div class="cat-tab-footer">
                    <span id="cat-info-pag" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Mostrando 0 a 0 de 0</span>
                    <div class="lc-pagination">
                        <button class="lc-page-btn" id="cat-btn-prev" onclick="cambiarPaginaTab(-1)"><i class='bx bx-chevron-left'></i></button>
                        <span id="cat-span-page" style="font-size:0.85rem; font-weight:700; color:var(--text-main); margin: 0 5px;">PÃ¡g 1</span>
                        <button class="lc-page-btn" id="cat-btn-next" onclick="cambiarPaginaTab(1)"><i class='bx bx-chevron-right'></i></button>
                    </div>
                </div>
                
                <button type="button" class="btn-cat-save-final" id="btn-save-ediciones" onclick="guardarEdicionesIncremental()">
                    <i class='bx bx-save' style="font-size:1.3rem;"></i> Guardar Ediciones
                </button>
            </div>
        </div>
        </div>
    `;

    const datalist = document.getElementById('lista-datalist-cuentas-cat');
    if (datalist && cuentasBaseGlobal) {
        datalist.innerHTML = cuentasBaseGlobal.map(c => `<option value="${c}">`).join('');
    }

    renderTablaEdicionCuentas();
};

// ==========================================
// 4. LÃ“GICA DEL MOTOR DE LA TABLA (FILTROS Y RENDER)
// ==========================================
function renderTablaEdicionCuentas() {
    const tbody = document.getElementById('cat-tbody-cuentas');
    if (!tbody) return;
    tbody.innerHTML = '';

    const usr_rolActivo = localStorage.getItem('nexus_rol') || 'cliente';
    // ðŸ’¡ FIX: Para la tabla tambiÃ©n usamos la variable global
    const puedeEliminar = (usr_rolActivo === 'admin' || cat_permisosActivos.includes('eliminar_cuentas') || cat_permisosActivos.includes('eliminar_usuarios'));

    let filtrados = cuentasEditando.filter(c => 
        (c.correo && c.correo.toLowerCase().includes(searchCatTexto)) || 
        (c.clave && c.clave.toLowerCase().includes(searchCatTexto)) ||
        (c.consulta && c.consulta.toLowerCase().includes(searchCatTexto))
    );

    let total = filtrados.length;
    let totalPages = Math.ceil(total / limitCatActual) || 1;
    
    if (pageCatActual > totalPages) pageCatActual = totalPages;
    if (pageCatActual < 1) pageCatActual = 1;

    let start = (pageCatActual - 1) * limitCatActual;
    let end = start + limitCatActual;
    let paginados = filtrados.slice(start, end);

    if (paginados.length === 0) {
        let msg = searchCatTexto ? "No se encontraron cuentas." : "La categorÃ­a estÃ¡ vacÃ­a. AÃ±ade cuentas arriba.";
        tbody.innerHTML = `<tr><td colspan="${puedeEliminar ? '9' : '8'}" style="text-align:center; padding:40px; color:var(--text-muted);"><i class='bx bx-ghost' style="font-size: 2rem; display:block; margin-bottom:10px; opacity:0.5;"></i>${msg}</td></tr>`;
    } else {
        paginados.forEach(c => {
            let idx = c.idOriginal;
            
            let tdSelect = puedeEliminar ? `<td style="text-align: center;"><input type="checkbox" class="cat-row-checkbox cat-item-checkbox" value="${idx}" onchange="checkCatRowSelection()"></td>` : '';
            let tdEliminar = puedeEliminar ? `<td style="text-align: center;"><button class="btn-trash-sm" onclick="borrarFilaCuentaTab(${idx})" title="Remover de la categorÃ­a"><i class='bx bx-trash'></i></button></td>` : '';

            tbody.innerHTML += `
                <tr class="fila-cuenta" data-index="${idx}">
                    ${tdSelect}
                    <td><input type="text" class="input-dblclick attr-correo" value="${c.correo || ''}" onchange="actualizarDatoTab(${idx}, 'correo', this.value)" readonly ondblclick="this.removeAttribute('readonly'); this.focus();" onblur="this.setAttribute('readonly', 'true')" placeholder="Vacio"></td>
                    <td><input type="text" class="input-dblclick attr-clave" value="${c.clave || ''}" onchange="actualizarDatoTab(${idx}, 'clave', this.value)" readonly ondblclick="this.removeAttribute('readonly'); this.focus();" onblur="this.setAttribute('readonly', 'true')" placeholder="Vacio"></td>
                    <td><input type="text" list="lista-datalist-cuentas-cat" class="input-dblclick attr-consulta" value="${c.consulta || ''}" onchange="actualizarDatoTab(${idx}, 'consulta', this.value)" readonly ondblclick="this.removeAttribute('readonly'); this.focus();" onblur="this.setAttribute('readonly', 'true')" placeholder="Autocompletar"></td>
                    <td style="text-align: center;"><input type="text" class="input-pin" value="${c.p1 || ''}" oninput="actualizarDatoTab(${idx}, 'p1', this.value)" maxlength="4" placeholder="----"></td>
                    <td style="text-align: center;"><input type="text" class="input-pin" value="${c.p2 || ''}" oninput="actualizarDatoTab(${idx}, 'p2', this.value)" maxlength="4" placeholder="----"></td>
                    <td style="text-align: center;"><input type="text" class="input-pin" value="${c.p3 || ''}" oninput="actualizarDatoTab(${idx}, 'p3', this.value)" maxlength="4" placeholder="----"></td>
                    <td style="text-align: center;"><input type="text" class="input-pin" value="${c.p4 || ''}" oninput="actualizarDatoTab(${idx}, 'p4', this.value)" maxlength="4" placeholder="----"></td>
                    ${tdEliminar}
                </tr>
            `;
        });
    }

    const infoSpan = document.getElementById('cat-info-pag');
    const spanPage = document.getElementById('cat-span-page');
    const btnPrev = document.getElementById('cat-btn-prev');
    const btnNext = document.getElementById('cat-btn-next');
    
    if (infoSpan) {
        let showStart = total === 0 ? 0 : start + 1;
        let showEnd = end > total ? total : end;
        infoSpan.innerText = `Mostrando ${showStart} a ${showEnd} de ${total}`;
        spanPage.innerText = `PÃ¡g ${pageCatActual} de ${totalPages}`;
        
        btnPrev.disabled = pageCatActual <= 1;
        btnNext.disabled = pageCatActual >= totalPages;
    }

    // Refrescar el estado de los checkboxes de selecciÃ³n masiva
    checkCatRowSelection();
}

window.buscarCuentasTab = function() {
    searchCatTexto = document.getElementById('cat-search-input').value.toLowerCase().trim();
    pageCatActual = 1;
    renderTablaEdicionCuentas();
};

window.cambiarLimiteTab = function() {
    limitCatActual = parseInt(document.getElementById('cat-limit-select').value, 10);
    pageCatActual = 1;
    renderTablaEdicionCuentas();
};

window.cambiarPaginaTab = function(dir) {
    pageCatActual += dir;
    renderTablaEdicionCuentas();
};

window.ordenarCuentasTabPorConsulta = function() {
    sortCatConsultaDir = sortCatConsultaDir === 'asc' ? 'desc' : 'asc';
    cuentasEditando.sort((a, b) => {
        let valA = (a.consulta || '').toLowerCase();
        let valB = (b.consulta || '').toLowerCase();
        if (valA < valB) return sortCatConsultaDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortCatConsultaDir === 'asc' ? 1 : -1;
        return 0;
    });
    cuentasEditando.forEach((c, idx) => c.idOriginal = idx);
    pageCatActual = 1;
    renderTablaEdicionCuentas();
};

window.actualizarDatoTab = function(indexOriginal, campo, valor) {
    if (cuentasEditando[indexOriginal]) {
        cuentasEditando[indexOriginal][campo] = valor.trim();

        if (campo === 'correo') {
            let nuevaConsulta = autoDetectarBandeja(valor.trim());
            cuentasEditando[indexOriginal]['consulta'] = nuevaConsulta;
            
            const fila = document.querySelector(`.fila-cuenta[data-index="${indexOriginal}"]`);
            if (fila) {
                const inputConsulta = fila.querySelector('.attr-consulta');
                if (inputConsulta) inputConsulta.value = nuevaConsulta;
            }
        }
    }
};

window.borrarFilaCuentaTab = function(indexOriginal) {
    const cuenta = cuentasEditando.find(c => c.idOriginal === indexOriginal);
    if (!cuenta) return;
    
    // Mover a la cola de eliminaciÃ³n
    cuentasParaEliminar.push(cuenta);
    cuentasEditando = cuentasEditando.filter(c => c.idOriginal !== indexOriginal);
    
    // Reindexamos visualmente la ediciÃ³n (opcional, pero Ãºtil)
    let paginasMax = Math.ceil(cuentasEditando.length / limitCatActual) || 1;
    if (pageCatActual > paginasMax) pageCatActual = paginasMax;
    
    renderTablaEdicionCuentas();
    renderTablaEliminar();
};

window.borrarSeleccionadosTab = function() {
    const checkboxes = document.querySelectorAll('.cat-item-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    const idsToDelete = Array.from(checkboxes).map(chk => parseInt(chk.value));
    
    const mover = cuentasEditando.filter(c => idsToDelete.includes(c.idOriginal));
    cuentasParaEliminar.push(...mover);
    
    cuentasEditando = cuentasEditando.filter(c => !idsToDelete.includes(c.idOriginal));
    
    let paginasMax = Math.ceil(cuentasEditando.length / limitCatActual) || 1;
    if (pageCatActual > paginasMax) pageCatActual = paginasMax;
    
    renderTablaEdicionCuentas();
    renderTablaEliminar();
    
    document.getElementById('cat-select-all').checked = false;
    checkCatRowSelection();
};

window.revertirEliminacionTab = function(correo) {
    const cuenta = cuentasParaEliminar.find(c => c.correo === correo);
    if (!cuenta) return;
    
    cuentasParaEliminar = cuentasParaEliminar.filter(c => c.correo !== correo);
    cuentasEditando.push(cuenta);
    
    renderTablaEdicionCuentas();
    renderTablaEliminar();
};

function renderTablaEliminar() {
    const bloque = document.getElementById('bloque-eliminar');
    const tbody = document.getElementById('cat-tbody-eliminar');
    if (!bloque || !tbody) return;
    
    if (cuentasParaEliminar.length === 0) {
        bloque.style.display = 'none';
        return;
    }
    
    bloque.style.display = 'block';
    tbody.innerHTML = cuentasParaEliminar.map(c => `
        <tr>
            <td style="color:#ef4444; text-decoration: line-through;">${c.correo}</td>
            <td style="color:#ef4444;">${c.consulta}</td>
            <td style="text-align: center;">
                <button class="btn-trash-sm" style="background:#22c55e; border-color:#22c55e;" onclick="revertirEliminacionTab('${c.correo}')" title="Revertir eliminaciÃ³n">
                    <i class='bx bx-undo' style="color:white;"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==========================================
// 4.5. LÃ“GICA DE SELECCIÃ“N Y ELIMINACIÃ“N MASIVA
// ==========================================
window.toggleAllCatCuentas = function(source) {
    const checkboxes = document.querySelectorAll('.cat-item-checkbox');
    checkboxes.forEach(chk => chk.checked = source.checked);
    checkCatRowSelection();
};

window.checkCatRowSelection = function() {
    const checkboxesChecked = document.querySelectorAll('.cat-item-checkbox:checked');
    const allCheckboxes = document.querySelectorAll('.cat-item-checkbox');
    const btnBulk = document.getElementById('btn-bulk-delete');
    const selectAll = document.getElementById('cat-select-all');
    
    if (btnBulk) {
        btnBulk.disabled = checkboxesChecked.length === 0;
        btnBulk.innerHTML = checkboxesChecked.length > 0 
            ? `<i class='bx bx-trash'></i> Mover a Eliminar (${checkboxesChecked.length})` 
            : `<i class='bx bx-trash'></i> Mover a Eliminar`;
    }
    
    if (selectAll && allCheckboxes.length > 0) {
        selectAll.checked = checkboxesChecked.length === allCheckboxes.length;
    } else if (selectAll) {
        selectAll.checked = false;
    }
};

function autoDetectarBandeja(correoCliente) {
    if (!correoCliente || !correoCliente.includes('@')) return '';
    if (cuentasBaseGlobal && cuentasBaseGlobal.length === 1) return cuentasBaseGlobal[0];
    
    let partes = correoCliente.split('@');
    let usuarioOriginal = partes[0].toLowerCase();
    let dominioOriginal = partes[1].toLowerCase();
    let usuarioLimpio = usuarioOriginal;
    
    if (dominioOriginal === 'gmail.com' || dominioOriginal === 'outlook.com' || dominioOriginal === 'hotmail.com') {
        usuarioLimpio = usuarioLimpio.replace(/\./g, '');
        let masIndex = usuarioLimpio.indexOf('+');
        if (masIndex !== -1) usuarioLimpio = usuarioLimpio.substring(0, masIndex);
        
        let correoBuscado = usuarioLimpio + '@' + dominioOriginal;
        let coincidencia = cuentasBaseGlobal.find(c => {
            if(!c || !c.includes('@')) return false;
            let baseParts = c.split('@');
            let baseUser = baseParts[0].toLowerCase().replace(/\./g, '').split('+')[0];
            let baseDom = baseParts[1].toLowerCase();
            return (baseUser + '@' + baseDom) === correoBuscado;
        });
        return coincidencia ? coincidencia : correoBuscado; 
    } else {
        let coincidencia = cuentasBaseGlobal.find(c => {
            if(!c || !c.includes('@')) return false;
            return c.split('@')[1].toLowerCase() === dominioOriginal; 
        });
        return coincidencia ? coincidencia : ''; 
    }
}

// ==========================================
// 6. MOTOR DE GUARDADO INCREMENTAL
// ==========================================

// BLOQUE 1: AÃ‘ADIR CUENTAS
window.guardarNuevasCuentasIncremental = async function() {
    const texto = document.getElementById('txt-masivo-cat-tab').value;
    const lineas = texto.split('\n');
    let cuentasNuevas = [];
    
    lineas.forEach(linea => {
        let limpia = linea.trim();
        if (limpia !== '') {
            let partes = limpia.split(':');
            let c_correo = partes[0] ? partes[0].trim() : '';
            let c_clave = partes[1] ? partes[1].trim() : '';
            
            // Validar que no exista ya en ediciÃ³n o eliminaciÃ³n
            let existe = cuentasEditando.find(c => c.correo === c_correo) || cuentasParaEliminar.find(c => c.correo === c_correo);
            if(!existe && c_correo !== '') {
                cuentasNuevas.push({
                    correo: c_correo, 
                    clave: c_clave, 
                    consulta: autoDetectarBandeja(c_correo), 
                    p1: '', p2: '', p3: '', p4: ''
                });
            }
        }
    });

    if (cuentasNuevas.length === 0) {
        if(typeof UI !== 'undefined') UI.toast("No se detectaron cuentas nuevas para enviar.", "warning");
        return;
    }

    const token = localStorage.getItem('nexus_token');
    const btn = document.getElementById('btn-save-nuevas');
    const txtOriginal = btn.innerHTML;
    btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Guardando...`;
    btn.disabled = true;

    try {
        const payload = { categoria_id: idCategoriaAbierta, cuentas: cuentasNuevas };
        const res = await fetch(API_BASE + 'api_categorias.php?action=add_cuentas_incremental', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            document.getElementById('txt-masivo-cat-tab').value = '';
            
            // Integrar a la tabla
            cuentasNuevas.forEach(c => {
                const cuentaObj = { ...c, idOriginal: cuentasEditando.length, correo_original: c.correo };
                cuentasEditando.push(cuentaObj);
                cuentasOriginales.push(JSON.parse(JSON.stringify(cuentaObj))); // Para que no cuente como ediciÃ³n
            });
            
            renderTablaEdicionCuentas();
            if(typeof UI !== 'undefined') UI.toast(`Se aÃ±adieron y guardaron ${cuentasNuevas.length} cuentas con Ã©xito.`, "success");
            actualizarCacheLocal();
        } else {
            if(typeof UI !== 'undefined') UI.alert(data.msg, "Error", "error");
        }
    } catch (error) {
        if(typeof UI !== 'undefined') UI.alert("Error de red", "Error", "error");
    } finally {
        btn.innerHTML = txtOriginal;
        btn.disabled = false;
    }
};

// BLOQUE 2: ELIMINAR CUENTAS
window.guardarEliminacionesIncremental = async function() {
    if (cuentasParaEliminar.length === 0) return;

    if (!confirm(`Â¿EstÃ¡s 100% seguro de borrar permanentemente estas ${cuentasParaEliminar.length} cuentas de la categorÃ­a?`)) return;

    const token = localStorage.getItem('nexus_token');
    const btn = document.getElementById('btn-save-eliminar');
    const txtOriginal = btn.innerHTML;
    btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Procesando...`;
    btn.disabled = true;

    try {
        const correosAEliminar = cuentasParaEliminar.map(c => c.correo);
        const payload = { categoria_id: idCategoriaAbierta, correos: correosAEliminar };
        
        const res = await fetch(API_BASE + 'api_categorias.php?action=delete_cuentas_incremental', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            // Eliminar de los originales tambiÃ©n para evitar conflictos
            cuentasOriginales = cuentasOriginales.filter(c => !correosAEliminar.includes(c.correo));
            cuentasParaEliminar = [];
            
            renderTablaEliminar();
            if(typeof UI !== 'undefined') UI.toast("Cuentas eliminadas del servidor con Ã©xito.", "success");
            actualizarCacheLocal();
        } else {
            if(typeof UI !== 'undefined') UI.alert(data.msg, "Error", "error");
        }
    } catch (error) {
        if(typeof UI !== 'undefined') UI.alert("Error de red", "Error", "error");
    } finally {
        btn.innerHTML = txtOriginal;
        btn.disabled = false;
    }
};

// BLOQUE 3: EDITAR CUENTAS
window.guardarEdicionesIncremental = async function() {
    // Detectar diferencias con cuentasOriginales
    let cuentasModificadas = [];
    
    cuentasEditando.forEach(edit => {
        const orig = cuentasOriginales.find(o => o.correo_original === edit.correo_original);
        if (orig) {
            // Comparar campos clave
            if (orig.clave !== edit.clave || orig.consulta !== edit.consulta ||
                orig.p1 !== edit.p1 || orig.p2 !== edit.p2 || orig.p3 !== edit.p3 || orig.p4 !== edit.p4 || orig.p5 !== edit.p5 || orig.p6 !== edit.p6) {
                cuentasModificadas.push(edit);
            }
        }
    });

    if (cuentasModificadas.length === 0) {
        if(typeof UI !== 'undefined') UI.toast("No hay ningÃºn cambio o ediciÃ³n que guardar.", "info");
        return;
    }

    const token = localStorage.getItem('nexus_token');
    const btn = document.getElementById('btn-save-ediciones');
    const txtOriginal = btn.innerHTML;
    btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Guardando Ediciones...`;
    btn.disabled = true;

    try {
        const payload = { categoria_id: idCategoriaAbierta, cuentas: cuentasModificadas };
        
        const res = await fetch(API_BASE + 'api_categorias.php?action=edit_cuentas_incremental', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            // Sincronizar originales
            cuentasOriginales = JSON.parse(JSON.stringify(cuentasEditando));
            if(typeof UI !== 'undefined') UI.toast(`Se guardaron ediciones en ${cuentasModificadas.length} cuentas.`, "success");
            actualizarCacheLocal();
        } else {
            if(typeof UI !== 'undefined') UI.alert(data.msg, "Error", "error");
        }
    } catch (error) {
        if(typeof UI !== 'undefined') UI.alert("Error de red", "Error", "error");
    } finally {
        btn.innerHTML = txtOriginal;
        btn.disabled = false;
    }
};

function actualizarCacheLocal() {
    const idx = categoriasDataLocal.findIndex(c => c.id === idCategoriaAbierta);
    if(idx !== -1) {
        const strCuentas = JSON.stringify(cuentasOriginales);
        categoriasDataLocal[idx].correos = strCuentas;
        try {
            let cacheCompleto = JSON.parse(localStorage.getItem('cache_lista_categorias') || '{"categorias":[]}');
            if (cacheCompleto.categorias) {
                const idxCache = cacheCompleto.categorias.findIndex(c => c.id === idCategoriaAbierta);
                if (idxCache !== -1) {
                    cacheCompleto.categorias[idxCache].correos = strCuentas;
                    localStorage.setItem('cache_lista_categorias', JSON.stringify(cacheCompleto));
                }
            }
        } catch(e) {}
    }
}
