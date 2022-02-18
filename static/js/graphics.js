$("#exampleModal").on("hide.bs.modal", e => { console.log("MODALE CHIUSO"); window.gs.setColor() });
var selected_combo_cards = 0
var selected_dices = 0
wait_players_modal(1)

/* ************************************************************************* */

function pickColor(){
    $("#unclosableModal").modal("hide")

    let colors = window.gs.colors
    
    let div_colors = ""
    //impostiamo il primo colore come quello dell'utente, così se il giocatore non fa una selezione
    // ne esiste una obbligata di default
    window.gs.me().color = colors[0]

    colors.forEach( color => {
        let span = ""
        if (color == colors[0])
            span = `<span class="color-selection" id="select-${color}" style=" display: inline-block; width: 65px; height: 40px; border: solid; background-color: ${color};" onclick="setColor('${color}')"></span>`
        else
            span = `<span class="color-selection" id="select-${color}" style=" display: inline-block; width: 65px; height: 40px; background-color: ${color}; " onclick="setColor('${color}')"></span>`
        div_colors += span
    })

    console.log("colori!!!")
    console.log(div_colors)

    $("#exampleModalLabel").text("Seleziona il tuo colore!")
    $("#exampleModalBody").empty()
    console.log("Creo i colori (non sono fatto)")
    $("#exampleModalBody").append(div_colors)

    console.log("Mostro il modale")
    $("#exampleModal").modal("show")
}

function setColor(color){
    //Nota: c'è una funzione analoga in globalState
    //questa salva il valore temporaneo scelto dall'utente 
    //(es. l'utente potrebbe cliccare rosso e subito dopo verde)
    //l'altra è "definitiva" in quanto toglie il colore dalla lista
    //dei colori disponibili e annuncia agli altri giocatori la
    //nostra scelta
    window.gs.me().color = color

    Object.keys($(".color-selection")).forEach ( span => {
        $($(".color-selection")[span]).css("border", "0px")
    })

    var selected = $(`#select-${color}`)
    if (color == "black")
        selected.css("border", "solid white")
    else 
        selected.css("border", "solid")

}

function start_putting_tanks(nations){

    $("#text_status").text("Tocca a te, posiziona le tue armate!")

    //disabilita dadi
    disable_dices(true)
    disable_dices(false)

    //disabilita bottoni
    Object.keys($("#dashboard button")).forEach(btn => { 
        try {
            $($("#dashboard button")[btn]).prop('disabled', true);
        } catch(exc) { /*do nothing*/ } 
    })

    nations.forEach( n => {

        $(`#${n}`).css("fill", window.gs.me().color)
        $($(`#${n}`).siblings()[1]).text(window.gs.me().countries[n])
        let image_already_present = false;
        Object.keys($(`#${n}`).siblings()).forEach( e => {
            if ($($(`#${n}`).siblings()[e]).prop("tagName") == "image")
                image_already_present = true
        })

        if (!image_already_present){
            let x = parseInt($($(`#${n}`).siblings()[1]).attr("x")) 
            let y = parseInt($($(`#${n}`).siblings()[1]).attr("y")) - 10

            var img = document.createElementNS('http://www.w3.org/2000/svg','image');
            img.setAttributeNS(null,'height','10px');
            img.setAttributeNS(null,'width','10px');
            img.setAttributeNS('http://www.w3.org/1999/xlink','href','../images/minus.png');
            img.setAttributeNS(null,'x', x + 21);
            img.setAttributeNS(null,'y', y);
            img.setAttributeNS(null, 'visibility', 'visible');
            $(img).click(e => remove_tank(e.target))
            if (!window.gs.final_phase || window.gs.final_phase && window.gs.me().countries[n] == 1)
                $(img).addClass("disabled")

            $(`#${n}`).parent().append(img)

            img = document.createElementNS('http://www.w3.org/2000/svg','image');
            img.setAttributeNS(null,'height','10px');
            img.setAttributeNS(null,'width','10px');
            img.setAttributeNS('http://www.w3.org/1999/xlink','href','../images/plus.png');
            img.setAttributeNS(null,'x', x + 31);
            img.setAttributeNS(null,'y', y);
            img.setAttributeNS(null, 'visibility', 'visible');
            $(img).click(e => add_tank(e.target))
            $(`#${n}`).parent().append(img)
            if (window.gs.final_phase)
                $(img).addClass("disabled")


        }
    })

}

function add_tank(element){

    if ($(element).attr('class') == "disabled"){
        return;
    }

    let state = ""
    let n = 0
    let text = null;
    Object.keys($(element).siblings()).forEach( e => {
        
        e = $(element).siblings()[e]

        if ($(e).prop("tagName") == "path"){
            state = $(e).prop("id")
        }
        if ($(e).prop("tagName") == "text" && $(e).attr('class') == "armate"){
            text = e;
            n = parseInt($(e).text())
        }
        if ($(e).prop("tagName") == "image"){
            $(e).removeClass("disabled")
        }
    })
    
    if (window.gs.me().getTanks() > 0){
        n += 1
        $(text).text(n)
        window.gs.me().addTanks(state, 1)
        updateTanksCounter(window.gs.me().getTanks())
    }
}

function remove_tank(element){

    if ($(element).attr('class') == "disabled"){
        return;
    }

    let state = ""
    let n = 0
    let text = null;
    Object.keys($(element).siblings()).forEach( e => {
        
        e = $(element).siblings()[e]
        if ($(e).prop("tagName") == "path"){
            state = $(e).prop("id")
        }
        if ($(e).prop("tagName") == "text" && $(e).attr('class') == "armate"){
            text = e;
            n = parseInt($(e).text())
            if (n == 1)
                return;
        }
    })

    if (n>1){
        n -= 1
        $(text).text(n)
        window.gs.me().removeTanks(state, 1, true)
        updateTanksCounter(window.gs.me().getTanks())
        if (n == 1)
            $(element).addClass("disabled")
        
    }

}

function updateTanksCounter(n){
    
    $("#tank_counter_dashboard").text(n)
    if (n == 0){
        Object.keys($("image")).forEach( i => {
            try {
                if ($($("image")[i]).prop("href").baseVal.endsWith("plus.png")){
                    $($("image")[i]).addClass("disabled")
                }
            } catch(error) {
                // do nothing
            }
        })
        if (window.gs.player_turn == window.gs.me().turno && window.gs.turn != 0 ){ 
            //se il turno è 0, non posso abilitare i bottoni come farei normalmente

            //se la funzione è stata invocata da draw_interface - perché altri giocatori
            //hanno conquistato/perso territori -, non posso abilitare i bottoni come 
            //farei normalmente perché non è il mio turno

            //infine, se è la fase di fine spostamento, non posso abilitare questi bottoni
            
            $("#attack_phase_btn").prop("disabled", false)
            if (!window.gs.final_phase)
                $("#move_btn").prop("disabled", false)
            $("#next-btn").prop("disabled", false)
            console.log("Grafica: DISABILITO NEXT-BTN")
            
        } else if (window.gs.turn == 0){
            $("#next-btn").prop("disabled", false)
            console.log("Grafica: DISABILITO NEXT-BTN")

        }
        
            
    } 
    if (n >= 1){


        Object.keys($("image")).forEach( i => {
            try {
                if ($($("image")[i]).prop("href").baseVal.endsWith("plus.png")){
                    $($("image")[i]).removeClass("disabled")
                }
            } catch(error) {
                // do nothing
            }
        })
        $("#attack_phase_btn").prop("disabled", true)
        $("#next-btn").prop("disabled", true)
        $("#move_btn").prop("disabled", true)


    }
    if (window.gs.me().getTanks() == window.gs.initial_tank_counter && window.gs.turn != 0 && !window.gs.final_phase){ 
        //non vale nel 'turno' di preparazione o nella fase di spostamento
        
        //se dopo che ho rimosso una armata il numero di carri torna ad essere 
        //quello che avevo inizialmente, allora non posso rimuovere altri carri
        // - perché starei facendo uno spostamento illegale di armate
        //quindi disabilito tutti i -
        Object.keys($("image")).forEach( i => {
            try {
                if ($($("image")[i]).prop("href").baseVal.endsWith("minus.png")){
                    console.log("Disabilito i meno!!!!")
                    $($("image")[i]).addClass("disabled")
                }
            } catch(error) {
                // do nothing
            }
        })
        //nota 1: non è necessario riabilitare i - quando la condizione non vale più
        //perché è già fatto da add_tank con il - interessato
        //nota 2: non è possibile aggiungere un carro ad e.g. alaska, rompere la condizione
        //e approfittarne quindi per toglierlo da un'altra nazione, perché per la nota 1. solo 
        // il - dell'alaska sarà abilitato

    }
}

function next(){
    $("#text_status").text("Hai passato!")
    window.move_to = ""
    window.move_from = ""

    //disabilita il click listener sugli stati
    $(".cls-4").off("click")

    //elimina tasti +/-
    while(Object.keys($(".cls-4 ~ image")).length > 2){
        let image = $(".cls-4 ~ image")[0]
        $(image).remove()
    }
    
    //disabilita dadi
    disable_dices(true)
    disable_dices(false)

    //disabilita bottoni
    Object.keys($("#dashboard button")).forEach(btn => { 
        try {
            btn = $("#dashboard button")[btn]
            if ($(btn).prop("tagName") == "BUTTON")
                $(btn).prop('disabled', true);
        } catch(exc) { /*do nothing*/ } 
    })



    window.gs.final_phase = false;

    window.gs.next();
}

function enable_dices(attack, n){
    
    console.log("DEVO ABILITARE " + n + " DADI")

    if (attack){
        $("#a1").removeClass("disabled")
        if (n > 1)
            $("#a2").removeClass("disabled")
        if (n > 2)
            $("#a3").removeClass("disabled")
    } else {
        $("#d1").removeClass("disabled")
        if (n > 1)
            $("#d2").removeClass("disabled")
        if (n > 2)
            $("#d3").removeClass("disabled")
    }
}

function disable_dices(attack){
    if (attack){
        $("#a1").addClass("disabled")
        $("#a2").addClass("disabled")
        $("#a3").addClass("disabled")
    } else {
        $("#d1").addClass("disabled")
        $("#d2").addClass("disabled")
        $("#d3").addClass("disabled")
    }
}

function dice_action(dice){
    //non posso sempre selezionare tutti i dadi, es. 
    //se difendo da una nazione che ha solo 1 carro al massimo posso selezionare un dado
    if ($(dice).hasClass("disabled"))
        return;

    if ($(dice).css("border-left-width") != "0px"){
        selected_dices -= 1
        $(dice).css("border", "0px")
    }
    else {
        $(dice).css("border", "solid")
        selected_dices += 1
    }

    //Nota: i dadi sono disattivati se non ho selezionato due territori
    //e i territori devono essere confinanti
    if (selected_dices > 0 && window.attacking_nation.length > 0 && window.attacked_nation.length > 0)
        $("#throw_dices").prop("disabled", false)
    else 
        $("#throw_dices").prop("disabled", true)


    
}

function throw_dice(){
    selected_dices = 0

    $("#throw_dices").prop('disabled', true)

    //cerchiamo i dadi attivi
    let attack = false;
    let numbers = []
    if ($("#a1").css("border-left-width") != "0px"){
        attack = true;
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "a1", "value": r})
    }
    if ($("#a2").css("border-left-width") != "0px"){
        attack = true;
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "a2", "value": r})

    }
    if ($("#a3").css("border-left-width") != "0px"){
        attack = true;
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "a3", "value": r})

    }
    
    if ($("#d1").css("border-left-width") != "0px"){
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "d1", "value": r})

    }
    if ($("#d2").css("border-left-width") != "0px"){
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "d2", "value": r})

    }
    if ($("#d3").css("border-left-width") != "0px"){
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "d3", "value": r})

    }

    numbers.forEach(n => {
        let img_name = "../images/dices/" + n.name;
        img_name = img_name.substring(0, img_name.length -1) + n.value + ".png"
        
        $(`#${n.name}`).attr("src",img_name);
        $(`#${n.name}`).css("border", "0px")

    })

    disable_dices(numbers[0].name.startsWith("a"));

    let _numbers = []
    numbers.forEach( n => { _numbers.push(n.value) })
    //comunica esito dei dadi agli altri
    if (attack){
        window.gs.attack_dices = _numbers
        window.gs.me().attacking = true
        window.comm.sendMessage({"command": "attack", "values": _numbers, "attacking": window.attacking_nation, "attacked": window.attacked_nation, "from": window.gs.me().turno})

        $("#next-btn").prop("disabled", true)
        $("#move_btn").prop("disabled", true)

    }
    else {
        let defense = {"command": "defense", "values": _numbers, "attacking": window.attacking_nation, "attacked": window.attacked_nation}
        window.comm.sendMessage(defense)
        window.gs.defend(defense)
    }

    $(".cls-4").off('click');
    
    
}

function set_dices(values, attack){
    console.log("Devo impostare i valori dei dadi di attacco: " + attack)
    console.log(values)
    let counter = 1
    values.forEach(n => {
        let img_name = "../images/dices/" + (attack ? "a" : "d") + n + ".png";
        let dice_name = (attack ? "a" : "d") + counter
        $(`#${dice_name}`).attr("src",img_name);
        $(`#${dice_name}`).css("border", "0px")

        counter += 1

    })
    
}

//chiamata a inizio turno o in altre fasi per aggiornare la grafica
function draw_interface(with_tanks_buttons){
    //contatore carri
    updateTanksCounter(window.gs.me().getTanks())

    //obiettivo
    $("#obj_dashboard").empty()
    $("#obj_dashboard").append(`<img src="../images/cards/${window.gs.me().ps.getObjective().image}">`)

    //mappa
    window.gs.players.forEach( p => {
        Object.keys(p.countries).forEach( c => {
            let n = p.countries[c]
            draw_country(c, n, p.color)
        })
    })

    //carte
    $("#cards_dashboard").empty()
    window.gs.me().ps.cards.forEach(c => {

        let html = `<span class="country_card"> <img name="${c.nome}" src="../images/cards/${c.image}"> </span>`
        $("#cards_dashboard").append(html)

    })

    if (window.gs.me().getTanks() > 0){

        //abilita combo - se c'è - viene fatto da globalState

        if (with_tanks_buttons){
            //bottoni per aggiungere carri ai territori
            start_putting_tanks(Object.keys(window.gs.me().countries))
        }

        //disabilita attacco, spostamento, passa turno viene fatto dalla funzione "next"

    } else if (window.gs.player_turn == window.gs.me().turno){
        //siccome non ci sono carri da disporre, possiamo abilitare le altre cose - se l'utente usa la combo,
        //attacco, spostamento, passa turno verrano comunque sempre disabilitati da updateTanksCounter

        $("#attack_phase_btn").prop("disabled", false)
        $("#move_btn").prop("disabled", false)
        $("#next-btn").prop("disabled", false)
        console.log("Grafica: DISABILITO NEXT-BTN")

            
    }

}

function card_action(img){
    if ($(img).css("border-left-width") != "0px"){
        selected_combo_cards -= 1
        $(img).css("border", "0px")
    }
    else {
        $(img).css("border", "4px solid red")
        selected_combo_cards += 1
    }

    //Nota: i dadi sono disattivati se non ho selezionato due territori
    //e i territori devono essere confinanti
    if (selected_combo_cards == 3)
        $("#combo_btn").prop("disabled", false)
    else 
        $("#combo_btn").prop("disabled", true)

}

function draw_country(country_name, number, color){
    $(`#${country_name}`).css("fill", color)

    let text = $(`#${country_name}`).siblings()[1]
    $(text).text(number)

}

function askUserCombo(){
    alert("Hai una combo a disposizione! Se la vuoi sfruttare, seleziona le carte che vuoi usare e clicca 'Usa combo'")
    $("#combo_btn").show()
    $("#combo_btn").prop("disabled", true)
    var _cards = $("span.country_card img")
    Object.keys(_cards).forEach( c => {
        if ($(_cards[c]).prop("tagName").toLowerCase() == "img"){
            $(_cards[c]).off('click');

            $(_cards[c]).click( e => { 
                card_action(e.target)
            })
        }
    })
}

function use_combo(){

    var _cards = $("span.country_card img")
    var selected_cards = []
    Object.keys(_cards).forEach( c => {
        try {
            if ($(_cards[c]).prop("tagName").toLowerCase() == "img" && $(_cards[c]).css("border-left-width") != "0px"){
                selected_cards.push($(_cards[c]).attr('name'))
                $(_cards[c]).css("border", "0px")
            }
        } catch (exc){
            //do nothing
        }
    })
    selected_combo_cards = 0

    //ho raccolto le carte selezionate dall'utente, controlliamo che sia una combo
    let tanks = window.gs.me().ps.useCombo(selected_cards)

    //abbiamo una combo, aggiorniamo la grafica: rimuoviamo le carte, nascondiamo il bottone...

    if (tanks > 0){
        draw_interface()
        $("#combo_btn").hide()
    }


}

function final_phase_move(){
    //abilita bottone per passare il turno e per attaccare
    $("#next-btn").prop("disabled", false)
    console.log("Grafica: DISABILITO NEXT-BTN")


    //abilita bottone per attaccare
    $("#attack_phase_btn").prop("disabled", false)
    window.attacking_nation = ""
    window.attacked_nation = ""

    //disabilita bottone per fase finale di movimento
    $("#move_btn").prop("disabled", true)

    //disabilita bottoni dadi etc., rimuovi tasti +, - per le armate
    while(Object.keys($(".cls-4 ~ image")).length > 2){
        let image = $(".cls-4 ~ image")[0]
        $(image).remove()
    }

    window.gs.final_phase = true
    
    $("#text_status").text("Clicca su due territori confinanti per lo spostamento!")

    window.move_from = ""
    window.move_to = ""

    $(".cls-4").off("click")
    $(".cls-4").click( e => { setCountryForMove(e.target);})
    console.log("Clicca sulle nazioni dove vuoi effettuare lo spostamento!")

    window.comm.sendMessage({"command": "update_status", "turno": window.gs.me().turno, "tanks": window.gs.me().countries, "turn": window.gs.turn})
    
}

function setCountryForMove(country){
    let country_name = $(country).prop("id")

    let move_from_text = window.move_from ? $(`#${window.move_from}`).siblings(".territorio").text() : ""
    let move_to_text = window.move_to ? $(`#${window.move_to}`).siblings(".territorio").text() : ""
    

    if (window.gs.me().countries[country_name]){
        if (window.move_from == country_name){
            
            deselectCountryMovePhase(country_name)


            $("#text_status").html("Da: <b>" + move_from_text + "</b> a: <b>" + move_to_text + "</b>")
            
            return;
        }
        if (window.move_to == country_name){
            deselectCountryMovePhase(country_name)

            $("#text_status").html("Da: <b>" + move_from_text + "</b> a: <b>" + move_to_text + "</b>")
            return;
        }

        if (window.move_from && window.move_to){
            console.log("Devi prima deselezionare un territorio!")

            $("#text_status").html("Da: <b>" + move_from_text + "</b> a: <b>" + move_to_text + "</b>")
            return;
        }
        
        if (!window.move_from){
            console.log("Imposto " + country_name + " come stato from")
            window.move_from = country_name
            move_from_text = window.move_from ? $(`#${window.move_from}`).siblings(".territorio").text() : ""

            window.original_tanks_from = parseInt($($(`#${window.move_from}`).siblings()[1]).text())
        } else {
            console.log("Imposto " + country_name + " come stato to")
            window.move_to = country_name
            move_to_text = window.move_from ? $(`#${window.move_to}`).siblings(".territorio").text() : ""

            window.original_tanks_to = parseInt($($(`#${window.move_to}`).siblings()[1]).text())

        }
        if (adjacency[window.move_from].find( n => n == window.move_to)) {
            //Nota: lo spostamento non avviene necessariamente da from a to, potrebbe
            //anche essere il contrario
            
            start_putting_tanks([window.move_from, window.move_to], true)
        } else {
            console.log("territori non adiacenti, considero from " + window.move_from + " come valido e cancello to")
            window.move_to = ""
            $("#throw_dices").prop("enabled", false)
        }

        $("#text_status").html("Da: <b>" + move_from_text + "</b> a: <b>" + move_to_text + "</b>")

    }

}

function deselectCountryMovePhase(country_name){
    if (window.move_from == country_name){
        console.log("Deseleziono " + country_name + " come stato from")

        console.log("Lo stato to è " + window.move_to)

        $($(`#${window.move_from}`).siblings()[1]).text(window.original_tanks_from)
        window.gs.me().countries[window.move_from] = window.original_tanks_from
        if (window.move_to){
            $($(`#${window.move_to}`).siblings()[1]).text(window.original_tanks_to)
            window.gs.me().countries[window.move_to] = window.original_tanks_to
        }

        window.move_from = ""
    } 
    if (window.move_to == country_name){
        console.log("Deseleziono " + country_name + " come stato to")
        console.log("Lo stato from è " + window.move_from)

        $($(`#${window.move_to}`).siblings()[1]).text(window.original_tanks_to)
        window.gs.me().countries[window.move_to] = window.original_tanks_to
        if (window.move_from){
            $($(`#${window.move_from}`).siblings()[1]).text(window.original_tanks_from)
            window.gs.me().countries[window.move_from] = window.original_tanks_from
        }
        
        window.move_to = ""
    }
    
    window.gs.me().tanks = 0
    updateTanksCounter(0)

    while(Object.keys($(".cls-4 ~ image")).length > 2){
        let image = $(".cls-4 ~ image")[0]
        $(image).remove()
    }
}

function attack_phase(){
    //disabilita bottone per fase d'attacco 
    $("#attack_phase_btn").prop('disabled', true)

    //bottone per combo si disabilita da solo dopo averlo usato
    
    //disabilita dadi e disposizione armate (rimuovi tasti +, - per le armate)
    while(Object.keys($(".cls-4 ~ image")).length > 2){
        let image = $(".cls-4 ~ image")[0]
        $(image).remove()
    }

    //abilita bottone per spostamento fine turno

    if (window.gs.final_phase){
        window.gs.final_phase = false
        deselectCountryMovePhase(window.move_from)
        deselectCountryMovePhase(window.move_to)
    }
    $("#combo_btn").prop('disabled', false)

    //abilita fine turno
    $("#next-btn").prop('disabled', false)


    $("#text_status").append("<div>Fase di attacco! Clicca su due territori, poi clicca sui dadi che vuoi usare</div>")
    
    $(".cls-4").off('click');
    $(".cls-4").click( e => { let dices = setCountryForAttack(e.target); if (dices > 0 ) enable_dices(true, dices) ; else disable_dices(true) ;})

    //la fase di attacco inizia dopo aver posizionato i carri, quindi devo segnalare agli
    //avversari le nuove quantità di carri sui miei territori

    window.comm.sendMessage({"command": "update_status", "turno": window.gs.me().turno, "tanks": window.gs.me().countries, "turn": window.gs.turn})

    console.log("Iniziamo la fase di attacco!")
    //setCountryForAttack mostra all'utente area messaggi per i territori selezionati come attacco/difesa
    window.attacking_nation = ""
    window.attacked_nation = ""

}

function setCountryForAttack(country){

    //non si attacca al turno 0 o quando non è il mio turno
    if (window.gs.player_turn != window.gs.me().turno || window.gs.turn == 0)
        return

    //imposta il territorio come attaccante o di difesa;
    //se è possibile attaccare, restituisce il numero di dadi con cui si può attaccare
    //(0 in caso negativo, 1, 2 o 3)


    let name = $(country).prop("id")

    if (window.gs.me().countries[name]){ //la nazione è mia
        if (window.attacking_nation == name){
            //voglio deselezionare la nazione
            window.attacking_nation = ""
            console.log("Tolgo la nazione " + country + " come attaccante")
            $("#throw_dices").prop("disabled", true)


        } else {
            window.attacking_nation = name
            console.log("Imposto la nazione " + country + " come attaccante")
        }
    } else {
        if (window.attacked_nation == name){
            //voglio deselezionare la nazione
            window.attacked_nation = ""
            console.log("Tolgo la nazione " + country + " come attaccata")
            $("#throw_dices").prop("disabled", true)

        } else {
            window.attacked_nation = name
            console.log("Imposto la nazione " + country + " come attaccata")
        }
    }

    let attacking_nation_text = window.attacking_nation ? $(`#${window.attacking_nation}`).siblings(".territorio").text() : ""
    let attacked_nation_text = window.attacked_nation ? $(`#${window.attacked_nation}`).siblings(".territorio").text() : ""
    $("#text_status").html("Da: <b>" + attacking_nation_text + "</b> a: <b>" + attacked_nation_text  + "</b>")
    


    let number = 0
    if (window.attacking_nation && window.attacked_nation){
        //controlliamo che siano confinanti
        adjacency[window.attacking_nation].forEach( n => {
            let tanks = window.gs.me().countries[window.attacking_nation]
            if (n == window.attacked_nation){
                if (tanks > 3){
                    
                    number = 3
                }
                else if (tanks > 1){
                    number = window.gs.me().countries[window.attacking_nation] - 1
                }
            }
                
        })
    }

    console.log("posso attaccare con " + number + " dadi")

    return number;

}

function end_game_modal(reason, obj){
    let modal = $("#unclosableModal")
    modal.find('.modal-title').text("Partita terminata!")
    modal.find('.modal-body').empty();
    modal.find('.modal-body').text(reason)
    if (obj){
        modal.find('.modal-body').append(`<div><img src="../images/cards/${obj.image}"></div>`)
    }
    modal.modal('show')
}

function wait_players_modal(logged_players){
    console.log("WAIT PLAYERS MODAL")
    let modal = $("#unclosableModal")
    modal.find('.modal-title').text("In attesa dei giocatori...")
    let counter = modal.find('.modal-body').find("#connected-players")
    if (counter.length == 0){
        modal.find('.modal-body').html(`
            <div class="progress" style="width: 90%">
                <div class="progress-bar" role="progressbar" id="connected-players" style="width: ${(1/players_in_lobby) * 100}%;" aria-valuenow="1" aria-valuemin="1" aria-valuemax="${players_in_lobby}">1/${players_in_lobby}</div>
            </div>
        `)
        modal.modal("show")

    } else {
        $(counter[0]).css("width", `${(logged_players/players_in_lobby)*100}%`) 
        $(counter[0]).prop("aria-valuenow", logged_players) 
        $(counter[0]).text(`${logged_players}/${players_in_lobby}`)
    }

    if (logged_players == players_in_lobby){
        modal.find('.modal-body').html("<div> In attesa degli altri giocatori...</div>")
    }

}