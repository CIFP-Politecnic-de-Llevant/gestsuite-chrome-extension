function notifica(notificacio) {
    if (window.Notification && Notification.permission !== "denied") {
        Notification.requestPermission(function (status) {  // status is "granted", if accepted by user

            new Notification(notificacio.tipus, {
                body: notificacio.missatge
            });
        });
    }
}

async function init(cursos){

    let body = '';
    body += '<style>';
    body += '.iesmanacor-oculta{display:none;}'
    body += '</style>';
    body += '<div id="iesmanacor-box" style="position: fixed; top: 10px; right: 10px;">';
    body += '<select id="iesmanacor-selector">';
    for(const curs of cursos){
        for(const grup of curs.grups) {
            body += `<option value="${grup.idgrup}">${curs.gestibNom} ${grup.gestibNom}</option>`;
        }
    }
    body += '</select>';
    body += '<button id="boto-pendents">Pendents</button>'
    body += '<div>';

    document.querySelector("body").innerHTML += body;
    document.querySelector("#boto-pendents").addEventListener('click',function(){
        const idgrup = document.querySelector("#iesmanacor-selector").value;
        let grupSelected;
        for(const curs of cursos){
            for(const grup of curs.grups){
                if(grup.idgrup===parseInt(idgrup)){
                    grupSelected = grup;
                }
            }
        }

        console.log("Grup seleccionat",grupSelected);

        //Taula Gestib. Ocultem totes les assignatures no pendents
        document.querySelectorAll("table.table_Principal tbody tr>td:nth-child(n+3)").forEach((cell)=> {
            let nomAssignatura = cell.innerText;
            nomAssignatura = nomAssignatura.replaceAll("&nbsp;","");
            nomAssignatura = nomAssignatura.trim();
            if(nomAssignatura){
                const submateriaTrobada = grupSelected.submateries.find(s=>s.gestibNom.toLowerCase().includes(nomAssignatura.toLowerCase()));
                if(submateriaTrobada || nomAssignatura==='Formació en centres de treball' || nomAssignatura.includes("Projecte de ")){
                    cell.classList.add("iesmanacor-oculta");
                }
            } else {
                cell.classList.add("iesmanacor-oculta");
            }
        })

        //Eliminem alumnes que no tenen pendents
        document.querySelectorAll("table.table_Principal tbody tr").forEach((fila)=>{
            let comptador = 0;
            for(const cell of fila.children){
                if(cell.classList && !cell.classList.contains("iesmanacor-oculta")){
                    comptador++;
                }
            }
            if(comptador<=2){
                fila.classList.add("iesmanacor-oculta");
            }
        })
    })
}



(async function(){
    console.log("Load dades inicials...");
    console.log("Init cursos...");
    const cursosFetch = await fetch("http://localhost:8090/api/core/public/curs/llistat");
    const cursos = await cursosFetch.json();
    //console.log(cursos);

    console.log("Init grups...");
    const grupsFetch = await fetch("http://localhost:8090/api/core/public/grup/llistat");
    const grups = await grupsFetch.json();
    //console.log(grups);

    console.log("Init submateries...");
    const submateriesFetch = await fetch("http://localhost:8090/api/core/public/submateria/llistat");
    const submateries = await submateriesFetch.json();
    //console.log(submateries);

    console.log("Init sessions...");
    const sessionsFetch = await fetch("http://localhost:8090/api/core/public/sessio/llistat");
    const sessions = await sessionsFetch.json();
    //console.log(sessions);

    for(const curs of cursos) {
        curs.grups = grups.filter(g => g.gestibCurs===curs.gestibIdentificador);

        for(const grup of curs.grups){
            const sessionsGrup = sessions.filter(s=>s.gestibGrup===grup.gestibIdentificador);
            //console.log("Sessions grup",sessionsGrup)
            //Submateries del grup basat en les seves sessions de Gestib
            grup.submateries = [];
            for(const sessio of sessionsGrup){
                const submateria = submateries.find(sub=>sub.gestibIdentificador===sessio.gestibSubmateria);
                grup.submateries.push(submateria);
            }

        }
    }
    cursos.sort((a,b)=>a.gestibNom.localeCompare(b.gestibNom));

    console.log("Cursos amb grups i submateries",cursos)

    await init(cursos);
})()


/*const nomsEstudis = document.querySelectorAll(".primeraCapcaleraTaula");
for(const nom of nomsEstudis){

    //Nom del CURS
    let nomParsed = nom.innerHTML.substring(
        nom.innerHTML.indexOf("Estudis:") + 8, //Sumem 8 perquè "Estudis:" són 8 caràcters
        nom.innerHTML.lastIndexOf("Grup:")
    );
    nomParsed = nomParsed.replaceAll("&nbsp;","");
    nomParsed = nomParsed.trim();


    //Nom del GRUP
    let grupParsed = nom.innerHTML.substring(
        nom.innerHTML.lastIndexOf("Grup:") + 5 //Sumem 5 perquè "Grup:" són 5 caràcters
    );
    grupParsed = grupParsed.replaceAll("&nbsp;","");
    grupParsed = grupParsed.trim();


}*/